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
    status: { 
        type: String, 
        required: true, 
        default: '1', 
        enum: ["0", "1", "-1"] // 0 = Fermé, 1 = Ouvert, -1 = Annulé
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

// Méthode pour formater la réponse
dossierSchema.methods.formatResponse = function () {
    const dossierData = this.toObject();
    delete dossierData._id;
    delete dossierData.__v;
    return dossierData;
};

const Dossier = mongoose.model('acl_dossiers', dossierSchema);
module.exports.Dossier = Dossier;
