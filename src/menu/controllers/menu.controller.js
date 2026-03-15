const {Menu} = require('../models/menu.model');
const { fetchOneValue } = require('../../../services/requetes');


// ADD Menu
exports.registerMenu = async (req, res) => {
    try {
        const { designation, type, route, svg, ordre, commentaire, parent, tbl_name } = req.body;

        const menu = new Menu({  designation, type, route, svg, ordre, commentaire, parent, tbl_name });

        await menu.save();
        
        // Récupérer tous les profils
        const menus = await Menu.find();

        // Supprimer les informations sensibles pour chaque profil
        const menuResponse = menus.map((menu, index) => ({
        ...menu.formatResponse(),
        position: index + 1, // Ajoute la position en commençant par 1
        }));

        // Réponse avec l'utilisateur sans le mot de passe
        res.status(201).json({
            status: true,
            message: 'Menu enregistré avec succès.',
            data: menuResponse,
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

//GET DETAILS MENU / CODE_MENU
exports.getMenuInfo = async (req, res) => {
    try {
        const code_menu = req.params.code_menu;

        const menu = await Menu.findOne({ code_menu: code_menu });
        if (!menu) {
            return res.status(404).json({ 
                status: false,
                message: 'Menu non trouvé.',
                data: {}
            });
        }

        // Supprimer les informations sensibles
        const menuResponse = menu.formatResponse(menu);

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: menuResponse
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

exports.getMenuByProfile = async (req, res) => {
    try {
        const profil = req.params.profil;

        // 1. Récupérer la liste des menus (brute)
        const rawMenu = await fetchOneValue({ profil: profil }, "menuList", "acl_privilege_profiles");

        if (!rawMenu || (Array.isArray(rawMenu) && rawMenu.length === 0)) {
            return res.status(404).json({
                status: false,
                message: "Aucun menu trouvé pour ce profil.",
                data: {}
            });
        }

        // 2. NETTOYAGE : Transforme ['code1, code2'] en ['code1', 'code2']
        // Le flatMap split chaque élément par la virgule et trim les espaces
        const cleanMenuCodes = Array.isArray(rawMenu) 
            ? rawMenu.flatMap(item => item.split(',').map(s => s.trim()))
            : rawMenu.split(',').map(s => s.trim());

        // 3. OPTIMISATION : Une seule requête pour tous les menus au lieu d'une boucle
        const menusFound = await Menu.find({ 
            code_menu: { $in: cleanMenuCodes } 
        });

        if (menusFound.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Les détails des menus sont introuvables.",
                data: []
            });
        }

        // 4. Formatage de la réponse
        const menuResponse = menusFound.map((menuItem, index) => ({
            ...menuItem.formatResponse(),
            position: index + 1
        }));

        res.status(200).json({
            status: true,
            message: "Succès.",
            data: menuResponse
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message || "Une erreur interne est survenue.",
            data: {}
        });
    }
};

//GET ALL MENU
exports.getMenuListe = async (req, res) => {
    try {
        // Récupérer tous les profils
        const menus = await Menu.find();

        // Supprimer les informations sensibles pour chaque profil
            const menuResponse = menus.map((menu, index) => ({
            ...menu.formatResponse(),
            position: index + 1, // Ajoute la position en commençant par 1
            }));
        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: menuResponse
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: []
        });
    }
};

// Mise A JOUR DU Menu
exports.updateMenu = async (req, res) => {
    try {
        const {  designation, type, route, svg, ordre, commentaire, code_menu, parent, tbl_name } = req.body;

        // Vérifier si le Menu existe
        const menu = await Menu.findOne({code_menu:code_menu});
        if (!menu) {
            return res.status(404).json({ 
                status: false,
                message: 'Menu non trouvé.',
                data: {}
            });
        }

        // Mettre à jour les champs modifiables
        if (designation) menu.designation = designation;
        if (type) menu.type = type;
        if (route) menu.route = route;
        if (svg) menu.svg = svg;
        if (ordre) menu.ordre = ordre;
        if (commentaire) menu.commentaire = commentaire;
        if (parent) menu.parent = parent;
        if (tbl_name) menu.tbl_name = tbl_name;

        menu.__v = menu.__v+1; // met a jour le nombre de modification d'un element

        // Enregistrer les modifications
        await menu.save();

        // Supprimer le mot de passe des données de la réponse
        const menuResponse = menu.formatResponse(menu);

        res.status(200).json({
            status: true,
            message: 'Menu mis à jour avec succès.',
            data: menuResponse
        });
    } catch (error) {
        res.status(400).json({ 
            status: true,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const code_menu = req.params.code_menu;

        // Vérifier si le menu existe
        const menu = await Menu.findOne({ code_menu: code_menu });
        if (!menu) {
            return res.status(404).json({ 
                status: false,
                message: 'Menu non trouvé.',
                data: {}
            });
        }

        // Supprimer le menu
        await Menu.deleteOne({ code_menu: code_menu });

        return res.status(200).json({
            status: true,
            message: 'Menu supprimé avec succès.',
            data: menu
        });
    } catch (error) {
        return res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

