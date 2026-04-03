const { Dossier } = require('../models/dossier.model');

// ADD DOSSIER
exports.registerDossier = async (req, res) => {
    try {
        const dossierData = req.body;

        // On peut faire des vérifications spécifiques ici, ex: num_dossier unique
        const existingDossier = await Dossier.findOne({ num_dossier: dossierData.num_dossier });
        if (existingDossier) {
            return res.status(400).json({ 
                status: false,
                message: 'Le dossier portant ce numéro existe déjà.',
                data: {}
            });
        }

        const dossier = new Dossier(dossierData);
        await dossier.save();
        
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

        const dossier = await Dossier.findOne({ code_dossier: code_dossier });
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
        // Optionnel : ajouter des filtres (corbeille, status, etc.)
        const dossiers = await Dossier.find({ corbeille: '0' }).sort({ createdAt: -1 });

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
        const updates = Object.keys(req.body);
        updates.forEach(update => {
            if (update !== 'code_dossier' && update !== '_id') {
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

        res.status(200).json({
            status: true,
            message: 'Dossier mis à jour avec succès.',
            data: dossier.formatResponse()
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
