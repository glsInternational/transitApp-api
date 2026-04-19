const mongoose = require('mongoose');
const {generateToken} = require('../../../utils/utils');
const {fetchOneValue} = require('../../../services/requetes');


// #### GESTION DES ADMINISTRATEURS ####
const administrateurSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        // unique:true,
        required: true, 
        trim: true 
    },
    genre: { type: String, required: true,enum: ["Masculin", "Feminin"] },
    telephone: { 
        unique: true,
        type: String, 
        required: true, 
        match: /^\+?[0-9]{1,4}\s?[0-9]{6,15}$/  // Validation pour le format de numéro de téléphone
    },
    email: { 
        type: String, 
        required: true,
        lowercase: true, 
        trim: true,
        // sparse: true, // <--- AJOUTE CECI : Permet d'avoir plusieurs valeurs nulles/absentes
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Validation pour le format d'email
    },
    password: { type: String, required: true, default: 'password' },
    token: { 
        type: String, 
        required: true, 
        unique: true,
        default: () => generateToken(16) 
    },
    profile: { 
        type: String,
        required: true,
        validate: {
        validator: async function(value) {
            // On vérifie si ce code_profile existe dans la collection acl_profiles
            const profile = await mongoose.model('acl_profiles').findOne({ code_profile: value });
            return !!profile; // Retourne true si le profil existe, sinon false
        },
        message: props => `Accès refusé : Le code profil "${props.value}" est inexistant.`
    }

    },
    type_compte: { type: String, default: '' },
    status: { 
        type: String, 
        required: true, 
        default: '1', 
        enum: ["0", "1", "-1"] // 0 = Inactif, 1 = Actif, -1 = Suspendu
    },
    corbeille: { 
        type: String, 
        required: true, 
        default: '0', 
        enum: ["0", "1", "-1"] // 0 = Pas dans la corbeille, 1 = Dans la corbeille
    },
    status_first_connexion: { 
        type: String, 
        required: true, 
        default: '0', 
        enum: ["0", "1"] // 0 = Jamais connecte, 1 = Deja connecte
    },
    photo_profile: {
        filename: { type: String, default: null },
        filetype: { type: String, default: null },
        filepath: { type: String, default: null }
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Méthode d'instance pour formater la réponse administrateur
administrateurSchema.methods.formatResponse = async function () {
    const adminData = this.toObject();
    delete adminData.password;
    delete adminData.__v;

    // Assurez-vous que le champ `profile` contient uniquement le chemin du fichier
    if (adminData.photo_profile && adminData.photo_profile.filepath) {
        adminData.photo_profile = adminData.photo_profile.filepath;
    }else{
        adminData.photo_profile = "";
    }

    if (adminData.profile) {
        adminData.profileName = await fetchOneValue({ code_profile: adminData.profile }, 'designation', 'acl_profiles');
    }
    
    return adminData;
};

administrateurSchema.index(
    { email: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { 
            email: { $type: "string", $gt: "" } // L'unicité ne s'applique que si c'est un string non vide
        } 
    }
);

const Administrateur = mongoose.model('acl_administrateurs', administrateurSchema);
module.exports.Administrateur = Administrateur;

