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
                awb_bl: dossier.awb_bl,
                colis: dossier.nb_colis,
                nb_colis: dossier.nb_colis,
                poids: dossier.poids_brut,
                poids_brut: dossier.poids_brut,
                volume: dossier.volume,
                description: dossier.description_marchandise,
                provenance: dossier.station_depart,
                valeur_fob_xof: dossier.valeur_fob_xof,
                valeur_fret_xof: dossier.valeur_fret_xof,
                valeur_assurance_xof: dossier.valeur_assurance_xof,
                assurance_totale: dossier.assurance_totale,
                valeur_caf_xof: dossier.valeur_caf_xof || dossier.total_valeur_caf,
                valeur_cfa: dossier.valeur_cfa,
                valeur: dossier.valeur,
                expediteur: dossier.expediteur?.nom_expediteur || dossier.expediteur?.nomEtPrenoms || dossier.expediteur,
                incoterm: dossier.incoterm,
                regime_douanier: dossier.regime_douanier,
                bureau_douane: dossier.etat_codage?.bureau_douane,
                type_voie: dossier.type_voie,
                date_arrivee: dossier.date_arrivee,
                devise: dossier.devise
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
            debours: { 
                agio: 0, 
                gestion_credit: 0, 
                passage_douane: 0,
                // Automatisme : Caution 0.25% du total des taxes pour les régimes spéciaux
                caution: ['D56', 'D18', '3000', '5000', '7000', 'S106'].includes(dossier.regime_douanier) 
                    ? Math.round((dossier.total_taxes_dossier || 0) * 0.0025) 
                    : 0
            },
            prestations: { 
                frais_fixes: 15000, 
                commission_gestion: 0,
                had: dossier.type_voie === 'aerienne' ? 10000 : 25000 // Automatisme voie
            }
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
        res.status(200).json({ status: true, data: invoice });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// RENDER INVOICE AS HTML
exports.renderInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).send("Facture non trouvée");
        }

        const html = InvoiceGenerator.generateHTML(invoice);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
