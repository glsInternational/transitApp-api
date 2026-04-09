const { Invoice } = require('../models/invoice.model');
const { Dossier } = require('../../dossier/models/dossier.model');
const InvoiceGenerator = require('../services/invoice-generator');

// GENERATE NEXT INVOICE NUMBER
const generateInvoiceNumber = async (type = 'F') => {
    const year = new Date().getFullYear();
    const count = await Invoice.countDocuments();
    return `${type}-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

// CREATE INVOICE FROM DOSSIER (Initial Drafting)
exports.createFromDossier = async (req, res) => {
    try {
        const { dossierCode } = req.params;
        const { type } = req.body; // 'proforma' ou 'final'
        const dossier = await Dossier.findOne({ code_dossier: dossierCode })
            .populate('client')
            .populate('expediteur');

        if (!dossier) {
            return res.status(404).json({ status: false, message: "Dossier non trouvé" });
        }

        const invoiceNumber = await generateInvoiceNumber();

        const invoiceData = {
            invoiceNumber,
            dossierId: dossierCode,
            type: type === 'final' ? 'final' : 'proforma',
            dossierInfo: {
                num_dossier: dossier.num_dossier,
                client: dossier.client?.importateur || dossier.client,
                awb_bl: dossier.awb_bl || dossier.lta || dossier.manifeste?.num_lta,
                colis: dossier.nb_colis || dossier.manifeste?.nb_colis || 0,
                nb_colis: dossier.nb_colis || dossier.manifeste?.nb_colis || 0,
                poids: dossier.poids_brut || dossier.manifeste?.pb || 0,
                poids_brut: dossier.poids_brut || dossier.manifeste?.pb || 0,
                volume: dossier.volume || 0,
                description: dossier.description_marchandise || dossier.manifeste?.description_marchandise,
                provenance: dossier.station_depart || dossier.aeroport,
                valeur_fob_xof: dossier.articles?.reduce((acc, a) => acc + (a.valeur_fob || 0), 0) || 0,
                valeur_fret_xof: dossier.articles?.reduce((acc, a) => acc + (a.fret || 0), 0) || 0,
                valeur_assurance_xof: dossier.articles?.reduce((acc, a) => acc + (a.assurance || 0), 0) || 0,
                assurance_totale: dossier.articles?.reduce((acc, a) => acc + (a.assurance || 0), 0) || 0,
                valeur_caf_xof: dossier.total_valeur_caf || dossier.articles?.reduce((acc, a) => acc + (a.valeur_caf || 0), 0) || 0,
                valeur_cfa: dossier.valeur_cfa || 0,
                valeur: dossier.valeur || 0,
                expediteur: dossier.expediteur?.nom || dossier.expediteur?.nom_expediteur || dossier.expediteur?.nomEtPrenoms || dossier.expediteur,
                incoterm: dossier.incoterm,
                regime_douanier: dossier.regime_douanier,
                bureau_douane: dossier.etat_codage?.bureau_douane,
                type_voie: dossier.type_voie,
                date_arrivee: dossier.date_arrivee,
                devise: dossier.devise,
                client_email: dossier.client?.email
            },
            // Initialiser les sections avec les données du dossier (Fiche Opératrice)
            douaneTaxes: { 
                dd: dossier.articles?.reduce((acc, a) => acc + (a.dd || 0), 0) || 0,
                rsta: dossier.articles?.reduce((acc, a) => acc + (a.rsta || 0), 0) || 0,
                pcs: dossier.articles?.reduce((acc, a) => acc + (a.pcs || 0), 0) || 0,
                pcc: dossier.articles?.reduce((acc, a) => acc + (a.pcc || 0), 0) || 0,
                pua: 0, 
                ts_douane: dossier.articles?.reduce((acc, a) => acc + (a.ts_douane || 0), 0) || 0,
                rpi: dossier.etat_codage?.rpi || 0,
                tva_douane: dossier.articles?.reduce((acc, a) => acc + (a.tva || 0), 0) || 0 
            },
        // Mapping intelligent des dépenses du dossier vers les débours de la facture
        const dossierDepenses = dossier.depenses || [];
        let totalAutresDepenses = 0;
        let magasinageDossier = 0;

        dossierDepenses.forEach(d => {
            const lib = (d.libelle || "").toLowerCase();
            const m = d.montant || 0;
            if (lib.includes('magasinage')) {
                magasinageDossier += m;
            } else {
                totalAutresDepenses += m;
            }
        });

        invoiceData.debours = { 
            agio: 0, 
            gestion_credit: 0, 
            passage_douane: 0,
            magasinage: magasinageDossier,
            autres: totalAutresDepenses,
            // Automatisme : Caution 0.25% du total des taxes pour les régimes spéciaux
            caution: ['D56', 'D18', '3000', '5000', '7000', 'S106'].includes(dossier.regime_douanier) 
                ? Math.round((dossier.total_taxes_dossier || 0) * 0.0025) 
                : 0
        };

        invoiceData.prestations = { 
            frais_fixes: 15000, 
            commission_gestion: 0,
            had: dossier.type_voie === 'aerienne' ? 10000 : 25000 // Automatisme voie
        };

        // --- CALCULS INITIAUX ---
        // 1. Douane HT & Total
        const dt = invoiceData.douaneTaxes || {};
        const ht_douane = (dt.dd || 0) + (dt.rsta || 0) + (dt.pcs || 0) + (dt.pcc || 0) + (dt.pua || 0) + (dt.ts_douane || 0) + (dt.rpi || 0);
        dt.subtotal_ht = ht_douane;
        dt.total_douane = ht_douane + (dt.tva_douane || 0);

        // 2. Debours
        const db = invoiceData.debours || {};
        db.total_debours = (db.agio || 0) + (db.gestion_credit || 0) + (db.passage_douane || 0) + (db.magasinage || 0) + (db.caution || 0) + (db.autres || 0);

        // 3. Prestations
        const pr = invoiceData.prestations || {};
        pr.total_prestations = (pr.frais_fixes || 0) + (pr.had || 0) + (pr.commission_gestion || 0);

        // 4. Grand Totals
        const total_ht = (dt.total_douane || 0) + (db.total_debours || 0) + (pr.total_prestations || 0);
        const tva_prestation = Math.round(pr.total_prestations * 0.18); // TVA 18% par défaut sur prestations
        const total_ttc = total_ht + tva_prestation;
        
        invoiceData.totals = {
            total_ht,
            tva_prestation,
            total_ttc,
            avance: 0,
            net_a_payer: total_ttc
        };

        const invoice = new Invoice(invoiceData);
        await invoice.save();

        res.status(201).json({
            status: true,
            message: 'Brouillon de facture créé.',
            data: invoice
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// UPDATE INVOICE (With full re-calculation)
exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Update dossierInfo if necessary or provide a way to sync it?
        // Let's only update standard modifiable invoice fields in this controller.
        
        // --- CALCULS ---
        // 1. Douane HT & Total
        const dt = data.douaneTaxes || {};
        const ht_douane = (dt.dd || 0) + (dt.rsta || 0) + (dt.pcs || 0) + (dt.pcc || 0) + (dt.pua || 0) + (dt.ts_douane || 0) + (dt.rpi || 0) + (dt.autres_taxes_tva || 0) + (dt.autres_taxes_non_tva || 0);
        dt.subtotal_ht = ht_douane;
        dt.total_douane = ht_douane + (dt.tva_douane || 0);

        // 2. Declaration section removed (fields moved to douaneTaxes)
        // ... handled in step 1 above

        // 3. Debours
        const db = data.debours || {};
        db.total_debours = (db.agio || 0) + (db.gestion_credit || 0) + (db.edition_declaration || 0) + (db.passage_douane || 0) + (db.magasinage || 0) + (db.assurance || 0) + (db.caution || 0) + (db.autres || 0);

        // 4. Prestations
        const pr = data.prestations || {};
        pr.total_prestations = (pr.frais_fixes || 0) + (pr.edition_decl || 0) + (pr.had || 0) + (pr.commission_gestion || 0) + (pr.livraison || 0) + (pr.frais_magasinage_comm || 0) + (pr.comm_avance_fonds || 0);

        // 5. Grand Totals
        const total_ht = (dt.total_douane || 0) + (db.total_debours || 0) + (pr.total_prestations || 0);
        const tva_prestation = data.totals?.tva_prestation || 0; // Usuellement 18% sur prestations ?
        const total_ttc = total_ht + tva_prestation;
        const net_a_payer = total_ttc - (data.totals?.avance || 0);

        data.totals = {
            total_ht,
            tva_prestation,
            total_ttc,
            avance: data.totals?.avance || 0,
            net_a_payer
        };

        const invoice = await Invoice.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            status: true,
            message: 'Facture mise à jour et calculée.',
            data: invoice
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// GET INVOICE LIST
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ corbeille: '0' }).sort({ createdAt: -1 });
        res.status(200).json({ status: true, data: invoices });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// GET INVOICE BY ID
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        
        if (invoice) {
            // Retro-fit to fix any empty fields dynamically from Dossier without overwriting invoice number
            const dossier = await Dossier.findOne({ code_dossier: invoice.dossierId }).populate('client').populate('expediteur');
            
            if (dossier) {
                let updated = false;
                
                const safeUpdate = (field, dValue) => {
                    if (!invoice.dossierInfo[field] && dValue !== undefined && dValue !== null && dValue !== 0 && dValue !== '0' && dValue !== '---') {
                        invoice.dossierInfo[field] = dValue;
                        updated = true;
                    }
                };

                const val_fob = dossier.articles?.reduce((acc, a) => acc + (a.valeur_fob || 0), 0) || 0;
                const val_fret = dossier.articles?.reduce((acc, a) => acc + (a.fret || 0), 0) || 0;
                const val_ass = dossier.articles?.reduce((acc, a) => acc + (a.assurance || 0), 0) || 0;
                const val_caf = dossier.total_valeur_caf || dossier.articles?.reduce((acc, a) => acc + (a.valeur_caf || 0), 0) || 0;

                safeUpdate('awb_bl', dossier.awb_bl || dossier.lta || dossier.manifeste?.num_lta);
                safeUpdate('colis', dossier.nb_colis || dossier.manifeste?.nb_colis);
                safeUpdate('nb_colis', dossier.nb_colis || dossier.manifeste?.nb_colis);
                safeUpdate('poids', dossier.poids_brut || dossier.manifeste?.pb);
                safeUpdate('poids_brut', dossier.poids_brut || dossier.manifeste?.pb);
                safeUpdate('volume', dossier.volume);
                safeUpdate('description', dossier.description_marchandise || dossier.manifeste?.description_marchandise);
                safeUpdate('provenance', dossier.station_depart || dossier.aeroport);
                safeUpdate('date_arrivee', dossier.date_arrivee);
                safeUpdate('valeur_fob_xof', val_fob);
                safeUpdate('valeur_fret_xof', val_fret);
                safeUpdate('valeur_assurance_xof', val_ass);
                safeUpdate('assurance_totale', val_ass);
                safeUpdate('valeur_caf_xof', val_caf);
                safeUpdate('valeur_cfa', dossier.valeur_cfa);
                safeUpdate('valeur', dossier.valeur);
                safeUpdate('expediteur', dossier.expediteur?.nom || dossier.expediteur?.nom_expediteur || dossier.expediteur?.nomEtPrenoms || dossier.expediteur);
                safeUpdate('client', dossier.client?.importateur || dossier.client);
                safeUpdate('client_email', dossier.client?.email);

                if (updated) {
                    await invoice.save();
                }
            }
        }

        res.status(200).json({ status: true, data: invoice });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// RENDER INVOICE AS HTML
exports.renderInvoice = async (req, res) => {
    try {
        let invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).send("Facture non trouvée");
        }

        const dossier = await Dossier.findOne({ code_dossier: invoice.dossierId }).populate('client').populate('expediteur');
        if (dossier) {
            let updated = false;
            
            const safeUpdate = (field, dValue) => {
                if (!invoice.dossierInfo[field] && dValue !== undefined && dValue !== null && dValue !== 0 && dValue !== '0' && dValue !== '---') {
                    invoice.dossierInfo[field] = dValue;
                    updated = true;
                }
            };

            const val_fob = dossier.articles?.reduce((acc, a) => acc + (a.valeur_fob || 0), 0) || 0;
            const val_fret = dossier.articles?.reduce((acc, a) => acc + (a.fret || 0), 0) || 0;
            const val_ass = dossier.articles?.reduce((acc, a) => acc + (a.assurance || 0), 0) || 0;
            const val_caf = dossier.total_valeur_caf || dossier.articles?.reduce((acc, a) => acc + (a.valeur_caf || 0), 0) || 0;

            safeUpdate('awb_bl', dossier.awb_bl || dossier.lta || dossier.manifeste?.num_lta);
            safeUpdate('colis', dossier.nb_colis || dossier.manifeste?.nb_colis);
            safeUpdate('nb_colis', dossier.nb_colis || dossier.manifeste?.nb_colis);
            safeUpdate('poids', dossier.poids_brut || dossier.manifeste?.pb);
            safeUpdate('poids_brut', dossier.poids_brut || dossier.manifeste?.pb);
            safeUpdate('date_arrivee', dossier.date_arrivee);
            safeUpdate('valeur_fob_xof', val_fob);
            safeUpdate('valeur_fret_xof', val_fret);
            safeUpdate('valeur_assurance_xof', val_ass);
            safeUpdate('assurance_totale', val_ass);
            safeUpdate('valeur_caf_xof', val_caf);
            safeUpdate('valeur_cfa', dossier.valeur_cfa);
            safeUpdate('valeur', dossier.valeur);
            safeUpdate('expediteur', dossier.expediteur?.nom || dossier.expediteur?.nom_expediteur || dossier.expediteur?.nomEtPrenoms || dossier.expediteur);
            safeUpdate('client', dossier.client?.importateur || dossier.client);
            safeUpdate('client_email', dossier.client?.email);

            if (updated) {
                invoice = await invoice.save();
            }
        }

        const html = InvoiceGenerator.generateHTML(invoice);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// SEND INVOICE BY EMAIL
exports.sendInvoiceEmail = async (req, res) => {
    try {
        const emailService = require('../../../services/emailService');
        const { email } = req.body;
        
        let invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ status: false, message: "Facture non trouvée" });

        const htmlContent = InvoiceGenerator.generateHTML(invoice);
        
        const destinataire = email || invoice.dossierInfo?.client_email || 'N/A';
        if (destinataire === 'N/A' || !destinataire.includes('@')) {
            return res.status(400).json({ status: false, message: "Adresse email du client invalide ou introuvable." });
        }

        let attachments = [];
        
        try {
            // Tentative de génération de PDF si html-pdf-node est installé
            const htmlPdfNode = require('html-pdf-node');
            let options = { format: 'A4', printBackground: true };
            let file = { content: htmlContent };
            
            const pdfBuffer = await htmlPdfNode.generatePdf(file, options);
            attachments.push({
                filename: `Facture_${invoice.invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            });
        } catch (e) {
            console.log("Impossible de générer le PDF avec html-pdf-node, envoi du mail sous format HTML sans pièce jointe.", e.message);
        }

        const nomClient = invoice.dossierInfo?.client || 'Cher(e) Partenaire';
        const typeFacture = invoice.type === 'proforma' ? 'Proforma' : 'Définitive';
        const numAwb = invoice.dossierInfo?.awb_bl || invoice.dossierInfo?.num_dossier || 'N/A';
        
        const subject = `Votre facture ${typeFacture} - ${invoice.invoiceNumber}`;
        const emailBodyHtml = `
            <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                <p>Bonjour <b>${nomClient}</b>,</p>
                <p>Veuillez recevoir ci-joint la facture <b>${typeFacture}</b> concernant votre dossier <b>${numAwb}</b>.</p>
                <br>
                <p>Restant à votre entière disposition pour toute information complémentaire.</p>
                <br>
                <p>Cordialement,<br>L'équipe GLS</p>
            </div>
        `;

        const emailSuccess = await emailService.sendEmail(destinataire, subject, emailBodyHtml, attachments);

        if (emailSuccess) {
            res.status(200).json({ status: true, message: `Email envoyé avec succès à ${destinataire}` });
        } else {
            res.status(500).json({ status: false, message: "Échec de l'envoi de l'email." });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};
