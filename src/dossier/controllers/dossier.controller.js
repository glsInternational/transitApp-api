const { Dossier } = require('../models/dossier.model');
const { RegimeDouanier } = require('../models/regime.model');
const { EtatDossier } = require('../models/etat_dossier.model');
const { createNotificationInternal } = require('../../notification/controllers/notification.controller');
const { Administrateur } = require('../../admin/models/admin.model');
const { logAction } = require('../../audit/services/audit.service');

// ADD DOSSIER
exports.registerDossier = async (req, res) => {
    try {
        const dossierData = req.body;
        const mongoose = require('mongoose');

        // Valider l'expéditeur (ignorer les strings invalides s'ils sont envoyés par l'ancienne interface)
        if (dossierData.expediteur && !mongoose.Types.ObjectId.isValid(dossierData.expediteur)) {
            delete dossierData.expediteur;
        }

        // On peut faire des vérifications spécifiques ici, ex: num_dossier unique
        const existingDossier = await Dossier.findOne({ num_dossier: dossierData.num_dossier });
        if (existingDossier) {
            return res.status(400).json({ 
                status: false,
                message: 'Le dossier portant ce numéro existe déjà.',
                data: {}
            });
        }

        // --- GESTION DU WORKFLOW ---
        // Attribuer automatiquement la première étape du workflow si non spécifié
        if (!dossierData.etat_dossier) {
            const premierEtat = await EtatDossier.findOne({ status: '1' }).sort({ ordre: 1 });
            if (premierEtat) {
                dossierData.etat_dossier = premierEtat.code;
            }
        }

        // Ajouter l'ouvreur comme premier intervenant
        if (req.user && req.user.token) {
            const createur = await Administrateur.findOne({ token: req.user.token });
            if (createur) {
                dossierData.intervenants = [{
                    role: 'OUVREUR',
                    utilisateur: createur._id,
                    date_assignation: new Date()
                }];
                // Initialiser l'historique
                if (dossierData.etat_dossier) {
                    dossierData.statut_history = [{
                        statut: dossierData.etat_dossier,
                        date: new Date(),
                        utilisateur: createur._id
                    }];
                }
            }
        }
        // ---------------------------

        const dossier = new Dossier(dossierData);
        await dossier.save();
        await dossier.populate(['client', 'expediteur', 'intervenants.utilisateur', 'statut_history.utilisateur']);

        // --- AUDIT ---
        await logAction(req, 'CREATE', 'DOSSIER', { 
            num_dossier: dossier.num_dossier, 
            client: dossier.client?.importateur || dossier.client 
        });

        // --- NOTIFICATION ---
        try {
            const admins = await Administrateur.find({ status: '1', corbeille: '0' });
            for (const admin of admins) {
                await createNotificationInternal(
                    admin.token, 
                    "Nouveau Dossier", 
                    `Le dossier ${dossier.num_dossier} pour le client ${dossier.client?.importateur || 'N/A'} a été ouvert.`,
                    'success',
                    { dossierCode: dossier.code_dossier }
                );
            }
        } catch (notifErr) {
            console.error("Erreur notification creation:", notifErr);
        }
        // --------------------
        
        res.status(201).json({
            status: true,
            message: 'Dossier créé avec succès.',
            data: dossier.formatResponse(),
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

// GET DETAILS DOSSIER / code_dossier
exports.getDossierInfo = async (req, res) => {
    try {
        const code_dossier = req.params.code_dossier;

        const dossier = await Dossier.findOne({ code_dossier: code_dossier }).populate(['client', 'expediteur', 'intervenants.utilisateur', 'statut_history.utilisateur']);
        if (!dossier) {
            return res.status(404).json({ 
                status: false,
                message: 'Dossier non trouvé.',
                data: {}
            });
        }

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: dossier.formatResponse()
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

// GET ALL DOSSIERS
exports.getDossierListe = async (req, res) => {
    try {
        let filter = { corbeille: '0' };

        // Si l'utilisateur est connecté, on filtre les dossiers
        if (req.user && req.user.token) {
            const admin = await Administrateur.findOne({ token: req.user.token });
            if (admin) {
                // Les Super Admins et Chefs Transit voient tout
                const role = admin.profile; // ex: CHEF_TRANSIT, SUPER_ADMIN
                const profileName = req.user.profileName; // ex: super-admin

                if (profileName !== 'super-admin' && role !== 'SUPER_ADMIN' && role !== 'CHEF_TRANSIT') {
                    // Les autres rôles (y compris l'ouvreur) ne voient que les dossiers où ils sont intervenants
                    filter['intervenants.utilisateur'] = admin._id;
                }
            }
        }

        const dossiers = await Dossier.find(filter).populate(['client', 'expediteur', 'intervenants.utilisateur', 'statut_history.utilisateur']).sort({ createdAt: -1 });

        const formattedDossiers = dossiers.map((d, index) => ({
            ...d.formatResponse(),
            position: index + 1
        }));

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: formattedDossiers
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: []
        });
    }
};

// UPDATE DOSSIER
exports.updateDossier = async (req, res) => {
    try {
        const { code_dossier } = req.body;

        const dossier = await Dossier.findOne({ code_dossier: code_dossier });
        if (!dossier) {
            return res.status(404).json({ 
                status: false,
                message: 'Dossier non trouvé.',
                data: {}
            });
        }

        // Mettre à jour tous les champs fournis dans req.body
        const mongoose = require('mongoose');
        const updates = Object.keys(req.body);
        updates.forEach(update => {
            if (update !== 'code_dossier' && update !== '_id') {
                if (update === 'expediteur' && !mongoose.Types.ObjectId.isValid(req.body[update])) {
                    if (req.body[update] === "") {
                        dossier.expediteur = undefined;
                    }
                    return; // Skip setting invalid expediteur
                }
                dossier[update] = req.body[update];
            }
        });

        // Gérer spécifiquement l'historique des duplicatas si besoin
        if (req.body.original_duplicata === "duplicata") {
            dossier.historique_duplicata.push({
                date: new Date(),
                commentaire: req.body.commentaire_duplicata || "Édition d'un duplicata"
            });
        }

        await dossier.save();
        await dossier.populate(['client', 'expediteur']);

        // --- AUDIT ---
        await logAction(req, 'UPDATE', 'DOSSIER', { 
            num_dossier: dossier.num_dossier, 
            champs_modifies: req.body 
        });

        // --- NOTIFICATION ---
        try {
            const admins = await Administrateur.find({ status: '1', corbeille: '0' });
            for (const admin of admins) {
                await createNotificationInternal(
                    admin.token, 
                    "Mise à jour Dossier", 
                    `Le dossier ${dossier.num_dossier} (${dossier.client?.importateur || 'N/A'}) a été mis à jour par un collaborateur.`,
                    'info',
                    { dossierCode: dossier.code_dossier }
                );
            }
        } catch (notifErr) {
            console.error("Erreur notification creation:", notifErr);
        }
        // --------------------

        res.status(200).json({
            status: true,
            message: 'Dossier mis à jour avec succès.',
            data: dossier.formatResponse(),
        });
    } catch (error) {
        res.status(400).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

// DELETE DOSSIER (corbeille)
exports.deleteDossier = async (req, res) => {
    try {
        const code_dossier = req.params.code_dossier;

        const dossier = await Dossier.findOne({ code_dossier: code_dossier });
        if (!dossier) {
            return res.status(404).json({
                status: false,
                message: 'Dossier non trouvé.',
                data: {}
            });
        }

        dossier.corbeille = '1';
        await dossier.save();

        // --- AUDIT ---
        await logAction(req, 'DELETE', 'DOSSIER', { num_dossier: dossier.num_dossier, status: 'archive' });

        res.status(200).json({
            status: true,
            message: 'Dossier mis dans la corbeille avec succès.',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Une erreur interne est survenue.",
            data: {}
        });
    }
};

// GET DOSSIERS IN CORBEILLE
exports.getDossiersCorbeille = async (req, res) => {
    try {
        const dossiers = await Dossier.find({ corbeille: '1' }).populate(['client', 'expediteur']).sort({ updatedAt: -1 });

        const formattedDossiers = dossiers.map((d, index) => ({
            ...d.formatResponse(),
            position: index + 1
        }));

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: formattedDossiers
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: []
        });
    }
};

// RESTORE DOSSIER FROM CORBEILLE
exports.restoreDossier = async (req, res) => {
    try {
        const code_dossier = req.params.code_dossier;

        const dossier = await Dossier.findOne({ code_dossier: code_dossier });
        if (!dossier) {
            return res.status(404).json({
                status: false,
                message: 'Dossier non trouvé.',
                data: {}
            });
        }

        dossier.corbeille = '0';
        await dossier.save();

        // --- AUDIT ---
        await logAction(req, 'RESTORE', 'DOSSIER', { num_dossier: dossier.num_dossier });

        res.status(200).json({
            status: true,
            message: 'Dossier restauré avec succès.',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Une erreur interne est survenue.",
            data: {}
        });
    }
};
// UPDATE OPERATION (FICHE OPÉRATRICE / ÉTAT DE CODAGE)
exports.updateOperation = async (req, res) => {
    try {
        const { code_dossier, etat_codage, articles, regime_fiscal, regime_douanier } = req.body;

        const dossier = await Dossier.findOne({ code_dossier: code_dossier });
        if (!dossier) {
            return res.status(404).json({ 
                status: false,
                message: 'Dossier non trouvé.',
                data: {}
            });
        }

        // Mettre à jour l'état de codage et les régimes
        if (etat_codage) {
            // Utiliser Object.assign pour préserver les getters/setters Mongoose et s'assurer de capturer tous les sous-champs
            dossier.etat_codage = { ...dossier.etat_codage.toObject(), ...etat_codage };
        }
        if (regime_fiscal) {
            dossier.regime_fiscal = regime_fiscal;
        }
        if (regime_douanier) {
            dossier.regime_douanier = regime_douanier;
        }

        // Mettre à jour les articles et recalculer les totaux par article
        if (articles && Array.isArray(articles)) {
            let consolidatedValeurCaf = 0;
            let consolidatedTotalTaxes = 0;
            let total_dd = 0, total_rsta = 0, total_pcs = 0, total_pcc = 0, total_tva = 0, total_airsi = 0;

            const updatedArticles = articles.map(art => {
                const valeur_caf = (Number(art.valeur_fob) || 0) + (Number(art.fret) || 0) + (Number(art.assurance) || 0);
                
                const art_dd = Number(art.dd) || 0;
                const art_rsta = Number(art.rsta) || 0;
                const art_pcs = Number(art.pcs) || 0;
                const art_pcc = Number(art.pcc) || 0;
                const art_tva = Number(art.tva) || 0;
                const art_airsi = Number(art.airsi) || 0;
                const art_ts_douane = Number(art.ts_douane) !== undefined && !isNaN(Number(art.ts_douane)) ? Number(art.ts_douane) : 20000;
                const art_autres = Number(art.autres_taxes) || 0;

                const total_taxes = art_dd + art_rsta + art_pcs + art_pcc + art_tva + art_airsi + art_ts_douane + art_autres;
                
                consolidatedValeurCaf += valeur_caf;
                consolidatedTotalTaxes += total_taxes;
                
                total_dd += art_dd;
                total_rsta += art_rsta;
                total_pcs += art_pcs;
                total_pcc += art_pcc;
                total_tva += art_tva;
                total_airsi += art_airsi;

                return {
                    ...art,
                    valeur_caf,
                    total_taxes
                };
            });
            dossier.articles = updatedArticles;
            dossier.total_valeur_caf = consolidatedValeurCaf;
            dossier.total_taxes_dossier = consolidatedTotalTaxes;
            
            dossier.total_dd = total_dd;
            dossier.total_rsta = total_rsta;
            dossier.total_pcs = total_pcs;
            dossier.total_pcc = total_pcc;
            dossier.total_tva = total_tva;
            dossier.total_airsi = total_airsi;
            
            if (dossier.etat_codage?.rpi) {
                dossier.total_taxes_dossier += Number(dossier.etat_codage.rpi) || 0;
                consolidatedTotalTaxes += Number(dossier.etat_codage.rpi) || 0;
            }

            // --- CALCUL AUTOMATIQUE DE LA CAUTION ---
            const { RegimeDouanier } = require('../models/regime.model');
            const findRegime = await RegimeDouanier.findOne({ code: dossier.regime_douanier });
            
            if (findRegime && findRegime.type === 'suspensif') {
                const taux = dossier.taux_caution || 0.0025;
                dossier.redevance_caution = Math.round(consolidatedTotalTaxes * taux);
            } else {
                dossier.redevance_caution = 0;
            }

            // Optionnel : Mettre à jour les totaux du dossier global si besoin
            if (dossier.etat_codage?.cours) {
                const total_fob_usd = updatedArticles.reduce((acc, art) => acc + (Number(art.valeur_fob) || 0), 0);
                dossier.valeur = total_fob_usd;
                dossier.valeur_cfa = total_fob_usd * dossier.etat_codage.cours;
                
                // Mettre à jour le poids total du dossier
                dossier.poids_brut = updatedArticles.reduce((acc, art) => acc + (Number(art.pb) || 0), 0);
                dossier.nb_colis = updatedArticles.reduce((acc, art) => acc + (Number(art.nb_colis) || 0), 0);
            }
        }

        await dossier.save();

        // --- AUDIT ---
        await logAction(req, 'UPDATE', 'OPERATION', { 
            num_dossier: dossier.num_dossier, 
            type: 'fiche_operatrice',
            details: 'Mise à jour des articles et calculs financiers'
        });

        res.status(200).json({
            status: true,
            message: 'Fiche opératrice mise à jour avec succès.',
            data: dossier.formatResponse(),
        });
    } catch (error) {
        res.status(400).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

// GET ALL REGIMES
exports.getRegimes = async (req, res) => {
    try {
        const regimes = await RegimeDouanier.find({ status: '1' }).sort({ code: 1 });
        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: regimes
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: []
        });
    }
};

// GET ALL ETATS DOSSIER
exports.getEtatDossiers = async (req, res) => {
    try {
        const etats = await EtatDossier.find({ status: '1' }).sort({ ordre: 1 });
        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: etats
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: []
        });
    }
};

// CREATE ETAT DOSSIER
exports.createEtatDossier = async (req, res) => {
    try {
        const etatData = req.body;
        const nouvelEtat = new EtatDossier(etatData);
        await nouvelEtat.save();
        
        res.status(201).json({
            status: true,
            message: 'Étape créée avec succès.',
            data: nouvelEtat
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: null
        });
    }
};

// UPDATE ETAT DOSSIER
exports.updateEtatDossier = async (req, res) => {
    try {
        const etatId = req.params.id;
        const updates = req.body;
        
        const etat = await EtatDossier.findByIdAndUpdate(etatId, updates, { new: true });
        if (!etat) {
            return res.status(404).json({
                status: false,
                message: 'Étape non trouvée.',
                data: null
            });
        }
        
        res.status(200).json({
            status: true,
            message: 'Étape mise à jour avec succès.',
            data: etat
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: null
        });
    }
};

// CHANGE DOSSIER STATUS & ADD INTERVENANT
exports.changeDossierStatus = async (req, res) => {
    try {
        const { code_dossier, nouveau_statut, intervenant_id, role } = req.body;

        const dossier = await Dossier.findOne({ code_dossier: code_dossier });
        if (!dossier) {
            return res.status(404).json({ 
                status: false,
                message: 'Dossier non trouvé.',
                data: {}
            });
        }

        if (nouveau_statut) {
            const etat = await EtatDossier.findOne({ code: nouveau_statut });
            if (!etat) {
                return res.status(400).json({
                    status: false,
                    message: "L'état spécifié n'existe pas.",
                    data: {}
                });
            }

            dossier.etat_dossier = nouveau_statut;
            
            // Enregistrer dans l'historique
            if (!dossier.statut_history) dossier.statut_history = [];
            dossier.statut_history.push({
                statut: nouveau_statut,
                date: new Date(),
                utilisateur: req.user?._id || req.user?.id
            });
        }

        if (intervenant_id && role) {
            // Ajouter le nouvel intervenant (vérifier s'il n'existe pas déjà pour ce rôle)
            if (!dossier.intervenants) dossier.intervenants = [];
            const exists = dossier.intervenants.find(i => i.role === role && i.utilisateur.toString() === intervenant_id);
            if (!exists) {
                dossier.intervenants.push({
                    role: role,
                    utilisateur: intervenant_id,
                    date_assignation: new Date()
                });
            }
        }

        await dossier.save();
        await dossier.populate(['client', 'expediteur', 'intervenants.utilisateur', 'statut_history.utilisateur']);

        // --- AUDIT ---
        await logAction(req, 'UPDATE', 'DOSSIER_STATUS', { 
            num_dossier: dossier.num_dossier, 
            nouveau_statut,
            intervenant_id,
            role
        });

        res.status(200).json({
            status: true,
            message: 'Statut du dossier mis à jour avec succès.',
            data: dossier.formatResponse(),
        });

    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

// REMOVE INTERVENANT
exports.removeIntervenant = async (req, res) => {
    try {
        const { code_dossier, utilisateur_id, role } = req.body;

        const dossier = await Dossier.findOne({ code_dossier: code_dossier });
        if (!dossier) {
            return res.status(404).json({ status: false, message: 'Dossier non trouvé.' });
        }

        // Filtrer pour retirer l'intervenant spécifique
        dossier.intervenants = dossier.intervenants.filter(
            i => !(i.utilisateur.toString() === utilisateur_id && i.role === role)
        );

        await dossier.save();
        await dossier.populate(['client', 'expediteur', 'intervenants.utilisateur']);

        // --- AUDIT ---
        await logAction(req, 'DELETE', 'INTERVENANT_REMOVED', { 
            num_dossier: dossier.num_dossier, 
            utilisateur_id,
            role
        });

        res.status(200).json({
            status: true,
            message: 'Intervenant retiré avec succès.',
            data: dossier.formatResponse(),
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};
