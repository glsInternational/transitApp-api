const mongoose = require('mongoose');
const {generateToken} = require('../../../utils/utils');
const {fetchOneValue} = require('../../../services/requetes');


// #### GESTION DES PROFILS ####
const droitSchema = new mongoose.Schema({
    profil: { type: String, required: true, unique: true },
    menuList: { type: Array, required: true },
    code_droit: { 
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
droitSchema.methods.formatResponse = async function () {
    const profileData = this.toObject();
    delete profileData._id;
    delete profileData.__v;

    // Récupérer les noms des menus en parallèle
    if (profileData.menuList && profileData.menuList.length > 0) {
        const menuPromises = profileData.menuList.map(async (item, index) => {
            try {
                const menuCode = typeof item === 'string' ? item : item.code;
                const menuData = await fetchOneValue({ code_menu: menuCode }, 'designation', 'acl_menus');
                if (menuData) {
                    profileData.menuListName = profileData.menuListName || [];
                    profileData.menuListName[index] = menuData;
                }
            } catch (error) {
                console.error(`Erreur lors de la récupération du menu :`, error);
            }
        });

        // Attendre que toutes les promesses soient résolues
        await Promise.all(menuPromises);
    } else {
        profileData.menuListName = [];
    }

    // Récupérer le profil
    if (profileData.profil) {
        try {
            const profile = await fetchOneValue({ code_profile: profileData.profil }, 'designation', 'acl_profiles');
            if (profile) {
                profileData.profilName = profile;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du profil:", error);
            profileData.profilName = "";
        }
    } else {
        profileData.profilName = "";
    }

    return profileData;
};


const Droit = mongoose.model('acl_privilege_profile', droitSchema);
module.exports.Droit = Droit;