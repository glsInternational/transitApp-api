const mongoose = require('mongoose');
const { generateToken } = require('../../../utils/utils');

// #### GESTION DES DOSSIERS DE TRANSIT ####
const dossierSchema = new mongoose.Schema({
    awb_bl: { type: String, trim: true },
    type_voie: { 
        type: String, 
        required: true, 
        enum: ["aerienne", "maritime"],
        default: "aerienne"
    },
    client: { 
        type: String, 
        required: true,
        trim: true 
    },
    regime_douanier: { type: String, trim: true },
    num_archivage: { type: String, trim: true },
    original_duplicata: { 
        type: String, 
        enum: ["original", "duplicata"],
        default: "original"
    },
    num_dossier: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    date_ouverture: { 
        type: Date, 
        default: Date.now 
    },
    historique_duplicata: [{
        date: { type: Date, default: Date.now },
        commentaire: String
    }],
    destinataire: { type: String, trim: true },
    valeur: { type: Number, default: 0 },
    devise: { type: String, default: "USD", trim: true },
    valeur_cfa: { type: Number, default: 0 },
    incoterm: { type: String, trim: true },
    nb_colis: { type: Number, default: 0 },
    poids_brut: { type: Number, default: 0 },
    description_marchandise: { type: String, trim: true },
    station_depart: { type: String, trim: true },
    expediteur: { type: String, trim: true },
    lta: { type: String, trim: true },
    date_arrivee: { type: Date },
    num_vol: { type: String, trim: true },
    aeroport: { type: String, trim: true },
    declarant_agent: { type: String, trim: true },
    conseiller: { type: String, trim: true },
    operatrice: { type: String, trim: true },
    compte_douane: { type: String, trim: true },
    cc: { type: String, trim: true },
    type_client: { type: String, trim: true },
    type_envoi: { type: String, trim: true },
    type_facturation: { type: String, trim: true },
    date_proforma_sous_reserve: { type: Date },
    date_proforma_definitive: { type: Date },
    delai_proforma_jours: { type: Number, default: 0 },
    date_bae_sortie: { type: Date },
    observations: { type: String, trim: true },
    
    // --- ACTIONS LIÉES AU DOSSIER ---
    
    // 1. MANIFESTE
    manifeste: {
        a_manifester: { type: String, default: 'non' },
        num_lta: { type: String, trim: true },
        date_lta: { type: Date },
        nb_colis: { type: Number },
        description_marchandise: { type: String, trim: true },
        importateur: { type: String, trim: true },
        pb: { type: Number }
    },

    // 2. DÉCLARATION EN DOUANE
    declaration_douane: {
        num_bon_provisoire: { type: String, trim: true },
        date_bon_provisoire: { type: Date },
        date_transmission_regularisation: { type: Date },
        num_declaration_detail: { type: String, trim: true },
        date_declaration_detail: { type: Date },
        age_bon_provisoire: { type: Number }, // En jours
        motif_non_regularisation: { type: String, trim: true }
    },

    // 3. SUIVI D56 ET D18
    suivi_d56_d18: {
        type_regime: { type: String, enum: ['D56', 'D18', 'Autre', 'Aucun'], default: 'Aucun' },
        duree_regime_jours: { type: Number }, // Durée initiale + prorogations
        echeance: { type: Date },
        unite_apurement: { type: String, trim: true },
        qte_apurement: { type: Number },
        reste_apurer: { type: Number },
        nbre_jours_restant: { type: Number }
    },

    // 4. APUREMENT (Dynamique / Multiple)
    apurements: [{
        index: { type: Number },
        regime: { type: String }, // nb ou libellé
        num_decl: { type: String },
        date_decl: { type: Date },
        qte_apuree: { type: Number },
        libelle: { type: String, trim: true },
        observation: { type: String, trim: true }
    }],

    // 5. FICHE OPÉRATRICE (ÉTAT DE CODAGE)
    etat_codage: {
        cours: { type: Number, default: 1 },
        mode_paiement: { type: String, trim: true },
        relation_acheteur_vendeur: { type: String, trim: true },
        code_additionnel: { type: String, trim: true },
        transfert: { type: String, trim: true },
        bureau_douane: { type: String, trim: true }
    },
    articles: [{
        nomenclature: { type: String, trim: true },
        pb: { type: Number, default: 0 },
        pn: { type: Number, default: 0 },
        valeur_fob: { type: Number, default: 0 },
        fret: { type: Number, default: 0 },
        assurance: { type: Number, default: 0 },
        valeur_caf: { type: Number, default: 0 }, // FOB + FRET + ASS
        dd: { type: Number, default: 0 },
        rsta: { type: Number, default: 0 },
        pcs: { type: Number, default: 0 },
        pcc: { type: Number, default: 0 },
        tva: { type: Number, default: 0 },
        airsi: { type: Number, default: 0 },
        autres_taxes: { type: Number, default: 0 },
        total_taxes: { type: Number, default: 0 },
        // Taux mémorisés pour l'audit
        rate_dd: { type: Number, default: 0 },
        rate_rsta: { type: Number, default: 0 },
        rate_pcs: { type: Number, default: 0 },
        rate_pcc: { type: Number, default: 0 },
        rate_tva: { type: Number, default: 0 }
    }],

    // --- RÉSULTATS CONSOLIDÉS (Calculés automatiquement côté Front/Back) ---
    regime_fiscal: { type: String, enum: ['Reel', 'Informel'], default: 'Reel' },
    total_valeur_caf: { type: Number, default: 0 },
    total_dd: { type: Number, default: 0 },
    total_rsta: { type: Number, default: 0 },
    total_pcs: { type: Number, default: 0 },
    total_pcc: { type: Number, default: 0 },
    total_tva: { type: Number, default: 0 },
    total_airsi: { type: Number, default: 0 },
    total_taxes_dossier: { type: Number, default: 0 },
    redevance_caution: { type: Number, default: 0 },
    taux_caution: { type: Number, default: 0.0025 },

    status: { 
        type: String, 
        required: true, 
        default: '1', 
        enum: ["0", "1", "-1"]
    },
    corbeille: { 
        type: String, 
        required: true, 
        default: '0', 
        enum: ["0", "1"] 
    },
    code_dossier: {
        type: String,
        unique: true,
        default: () => generateToken(12)
    }
}, {
    timestamps: true
});

dossierSchema.methods.formatResponse = function () {
    const dossierData = this.toObject();
    delete dossierData._id;
    delete dossierData.__v;
    return dossierData;
};

const Dossier = mongoose.model('acl_dossiers', dossierSchema);
module.exports.Dossier = Dossier;
