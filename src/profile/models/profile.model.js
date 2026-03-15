const mongoose = require('mongoose');
const {generateToken} = require('../../../utils/utils')

// #### GESTION DES PROFILS ####
const profileSchema = new mongoose.Schema({
    designation: { type: String, required: true, trim: true, lowercase: true, unique: true },
    actions: { type: Array, required: true },
    visibilite: { type: Array, required: true },
    type_accueil: { type: String, trim: true, default: "*" },
    bloc_visible: { type: Array, default: [] },
    code_profile: { 
        type: String, 
        required: true, 
        default: () => generateToken(16) 
    },
    commentaire: { type: String, trim: true },
    status: { type: String, default: '1', enum: ["0", "1", "-1"] }, // 0 inactif , 1 Actif , -1 Suspendu
    corbeille: { type: String, default: '0', enum: ["0", "1", "-1"] } // 0 pas dans la corbeille , 1 dans la corbeille
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Méthode d'instance pour formater la réponse profile
profileSchema.methods.formatResponse = function () {
    const profileData = this.toObject();
    delete profileData._id;
    delete profileData.__v;
    return profileData;
};

const Profile = mongoose.model('acl_profiles', profileSchema);
module.exports.Profile = Profile;