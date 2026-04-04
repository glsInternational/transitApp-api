const mongoose = require('mongoose');

const tarifSchema = new mongoose.Schema({
    code_sh: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        index: true
    },
    libelle: { type: String, required: true, trim: true },
    dd: { type: Number, default: 0 },
    tva: { type: Number, default: 0 },
    pcc: { type: Number, default: 0 },
    pcs: { type: Number, default: 0 },
    pua: { type: Number, default: 0 },
    rst: { type: Number, default: 0 },
    
    // Taxes additionnelles pour extension future
    autres_taxes: { type: Map, of: Number, default: {} },
    
    // Concordance SH 2017 -> 2022
    historical_mappings: [{
        code_sh_2017: { type: String, trim: true },
        libelle_2017: { type: String, trim: true },
        dd_2017: { type: Number }
    }],

    status: { type: String, default: '1' }
}, {
    timestamps: true
});

const TarifDouanier = mongoose.model('acl_tarifs_douaniers', tarifSchema);
module.exports.TarifDouanier = TarifDouanier;
