const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true, required: true },
    dossierId: { type: String, required: true }, // code_dossier
    dateInvoice: { type: Date, default: Date.now },
    type: { type: String, enum: ['proforma', 'final'], default: 'proforma' },

    // DOSSIER INFO (Snapshot from Dossier at creation)
    dossierInfo: {
        num_dossier: String,
        client: String,
        awb_bl: String,
        colis: Number,
        poids: Number,
        description: String,
        provenance: String,
        expediteur: String,
        incoterm: String,
        devise: String,
        valeur: Number,
        valeur_cfa: Number,
        valeur_fob_eur: Number,
        valeur_fob_xof: Number,
        valeur_fret_xof: Number,
        valeur_assurance_xof: Number,
        assurance_totale: Number,
        valeur_caf_xof: Number,
        regime_douanier: String,
        bureau_douane: String,
        type_voie: String,
        date_arrivee: Date,
        poids_brut: Number,
        nb_colis: Number,
        volume: Number
    },

    // 1. DROITS & TAXES DE DOUANE (Calculated)
    douaneTaxes: {
        dd: { type: Number, default: 0 },
        rsta: { type: Number, default: 0 },
        pcs: { type: Number, default: 0 },
        pcc: { type: Number, default: 0 },
        pua: { type: Number, default: 0 },
        ts_douane: { type: Number, default: 0 },
        rpi: { type: Number, default: 0 },
        autres_taxes_tva: { type: Number, default: 0 },
        autres_taxes_non_tva: { type: Number, default: 0 },
        subtotal_ht: { type: Number, default: 0 },
        tva_douane: { type: Number, default: 0 },
        total_douane: { type: Number, default: 0 }
    },

    // 3. DEBOURS DIVERS
    debours: {
        agio: { type: Number, default: 0 },
        gestion_credit: { type: Number, default: 0 },
        edition_declaration: { type: Number, default: 0 },
        sortie_provisoire: { type: Number, default: 0 },
        passage_douane: { type: Number, default: 0 },
        depot_douane: { type: Number, default: 0 },
        amende_douane: { type: Number, default: 0 },
        magasinage: { type: Number, default: 0 },
        assurance: { type: Number, default: 0 },
        caution: { type: Number, default: 0 },
        autres: { type: Number, default: 0 },
        total_debours: { type: Number, default: 0 }
    },

    // 4. PRESTATIONS TRANSIT
    prestations: {
        frais_fixes: { type: Number, default: 0 },
        edition_decl: { type: Number, default: 0 },
        had: { type: Number, default: 0 },
        commission_gestion: { type: Number, default: 0 },
        escorte: { type: Number, default: 0 },
        fdi: { type: Number, default: 0 },
        livraison: { type: Number, default: 0 },
        frais_magasinage_comm: { type: Number, default: 0 },
        comm_avance_fonds: { type: Number, default: 0 },
        total_prestations: { type: Number, default: 0 }
    },

    // TOTALS
    totals: {
        total_ht: { type: Number, default: 0 },
        tva_prestation: { type: Number, default: 0 },
        total_ttc: { type: Number, default: 0 },
        avance: { type: Number, default: 0 },
        net_a_payer: { type: Number, default: 0 }
    },

    status: { type: String, enum: ['draft', 'sent', 'paid', 'cancelled'], default: 'draft' },
    corbeille: { type: String, default: '0' }
}, {
    timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = { Invoice };
