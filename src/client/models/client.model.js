const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    importateur: { 
        type: String, 
        required: true, 
        trim: true 
    },
    ncc: { 
        type: String, 
        trim: true 
    },
    adresse: { 
        type: String, 
        trim: true 
    },
    email: { 
        type: String, 
        trim: true,
        lowercase: true
    },
    telephone: { 
        type: String, 
        trim: true 
    },
    status: { 
        type: String, 
        required: true, 
        default: '1',
        enum: ["0", "1"] // 0: Inactif, 1: Actif
    },
    pays: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'acl_pays',
        required: true
    },
    tarif_fret: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true
});

const Client = mongoose.model('acl_clients', clientSchema);
module.exports.Client = Client;
