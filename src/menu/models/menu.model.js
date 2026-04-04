const mongoose = require('mongoose');
const {generateToken} = require('../../../utils/utils')

// #### GESTION DES MENU ####
const menuSchema = new mongoose.Schema({
    designation: { type: String, required: true, trim: true, lowercase: true, unique: true},
    type: { type: String, trim: true, enum:["enfant","parent","dynamique"], required:true},
    route: { type: String, trim: true, required:true},
    svg: { type: String},
    ordre: { type: String, required:true }, // "unique: true" retiré et géré via un index composé
    code_menu: { 
        type: String, 
        required: true, 
        default: () => generateToken(16), 
        unique:true,
    },
    commentaire: { type: String, trim: true },
    parent: { type: String, trim: true, default: "" }, // Chaîne vide par défaut pour stabiliser l'index composé
    tbl_name: { type: String, trim: true },
    status: { type: String, default: '1', enum: ["0", "1", "-1"] }, // 0 inactif , 1 Actif , -1 Suspendu
    corbeille: { type: String, default: '0', enum: ["0", "1", "-1"] } // 0 pas dans la corbeille , 1 dans la corbeille
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index composé : l'ordre est géré par le contrôleur pour être séquentiel.
// On retire la contrainte unique car la logique logicielle de réorganisation s'en charge.
menuSchema.index({ ordre: 1, parent: 1 });


// Méthode d'instance pour formater la réponse menu
menuSchema.methods.formatResponse = function () {
    const menuData = this.toObject();
    delete menuData._id;
    delete menuData.__v;
    return menuData;
};

const Menu = mongoose.model('acl_menus', menuSchema);

// On s'assure que les anciens index uniques sont supprimés pour permettre la réorganisation automatique
Menu.collection.dropIndex("ordre_1").catch(() => {});
Menu.collection.dropIndex("ordre_1_parent_1").catch(() => {});


module.exports.Menu = Menu;