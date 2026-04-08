const mongoose = require('mongoose');

const expediteurSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        required: true, 
        trim: true 
    },
    adresse: { 
        type: String, 
        trim: true 
    },
    telephone: { 
        type: String, 
        trim: true 
    },
    email: { 
        type: String, 
        trim: true,
        lowercase: true
    },
    pays: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'acl_pays',
        required: true
    },
    status: { 
        type: String, 
        required: true, 
        default: '1',
        enum: ["0", "1"] // 0: Inactif, 1: Actif
    }
}, {
    timestamps: true
});

const Expediteur = mongoose.model('acl_expediteurs', expediteurSchema);
module.exports.Expediteur = Expediteur;
