const mongoose = require('mongoose');
const {generateToken} = require('../../../utils/utils')

// #### GESTION DES MENU ####
const menuSchema = new mongoose.Schema({
    designation: { type: String, required: true, trim: true, lowercase: true, unique: true},
    type: { type: String, trim: true, enum:["enfant","parent","dynamique"], required:true},
    route: { type: String, trim: true, required:true},
    svg: { type: String},
    ordre: { type: String, required:true, unique: true},
    code_menu: { 
        type: String, 
        required: true, 
        default: () => generateToken(16), 
        unique:true,
    },
    commentaire: { type: String, trim: true },
    parent: { type: String, trim: true },
    tbl_name: { type: String, trim: true },
    status: { type: String, default: '1', enum: ["0", "1", "-1"] }, // 0 inactif , 1 Actif , -1 Suspendu
    corbeille: { type: String, default: '0', enum: ["0", "1", "-1"] } // 0 pas dans la corbeille , 1 dans la corbeille
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Méthode d'instance pour formater la réponse menu
menuSchema.methods.formatResponse = function () {
    const menuData = this.toObject();
    delete menuData._id;
    delete menuData.__v;
    return menuData;
};

const Menu = mongoose.model('acl_menus', menuSchema);
module.exports.Menu = Menu;