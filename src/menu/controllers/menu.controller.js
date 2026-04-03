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
        if (error.code === 11000) {
            let errorMessage = "Un élément avec cet identifiant ou cet ordre existe déjà.";
            if (error.keyPattern && error.keyPattern.ordre) {
                errorMessage = "Cet ordre d'affichage est déjà utilisé pour ce parent. Veuillez en choisir un autre.";
            } else if (error.keyPattern && error.keyPattern.designation) {
                errorMessage = "Cette désignation de menu existe déjà.";
            }
            return res.status(409).json({
                status: false,
                message: errorMessage,
                data: {}
            });
        }
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

        const defaultDashboard = {
            designation: "Tableau de bord",
            type: "enfant",
            route: "/",
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
            ordre: "0",
            code_menu: "default_dashboard",
            status: "1",
            corbeille: "0"
        };

        if (!rawMenu || (Array.isArray(rawMenu) && rawMenu.length === 0)) {
            return res.status(200).json({
                status: true,
                message: "Menu par défaut (Tableau de bord).",
                data: [defaultDashboard]
            });
        }

        // 2. NETTOYAGE : Transforme [{code, actions}, ...] ou ['code1, code2'] en ['code1', 'code2']
        let cleanMenuCodes = [];
        if (Array.isArray(rawMenu)) {
            cleanMenuCodes = rawMenu.flatMap(item => {
                if (typeof item === 'object' && item.code) return item.code;
                if (typeof item === 'string') return item.split(',').map(s => s.trim());
                return [];
            });
        } else if (typeof rawMenu === 'string') {
            cleanMenuCodes = rawMenu.split(',').map(s => s.trim());
        }

        // 3. Récupérer les menus
        let menusFound = await Menu.find({ 
            code_menu: { $in: cleanMenuCodes } 
        });

        // 4. SÉCURITÉ : Ajouter les parents manquants pour assurer l'affichage dans la sidebar
        const parentCodes = [...new Set(menusFound.map(m => m.parent).filter(p => p && p !== ""))];
        if (parentCodes.length > 0) {
            const missingParents = await Menu.find({
                code_menu: { $in: parentCodes },
                code_menu: { $nin: menusFound.map(m => m.code_menu) }
            });
            menusFound = [...menusFound, ...missingParents];
        }

        // 5. Formatage et ajout systématique du Tableau de bord s'il n'y est pas
        let menuResponse = menusFound.map((menuItem, index) => ({
            ...menuItem.formatResponse(),
            position: index + 1
        }));

        // Vérifier si un menu avec route "/" existe déjà
        const hasDashboard = menuResponse.some(m => m.route === "/" || m.code_menu === "default_dashboard");
        
        if (!hasDashboard) {
            menuResponse = [ { ...defaultDashboard, position: 0 }, ...menuResponse ];
        }

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

        // Mettre à jour les champs modifiables de manière stricte (!== undefined)
        // Cela permet de recevoir une chaîne vide "" pour supprimer un parent par exemple
        if (designation !== undefined) menu.designation = designation;
        if (type !== undefined) menu.type = type;
        if (route !== undefined) menu.route = route;
        if (svg !== undefined) menu.svg = svg;
        if (ordre !== undefined) menu.ordre = ordre;
        if (commentaire !== undefined) menu.commentaire = commentaire;
        if (parent !== undefined) menu.parent = parent; 
        if (tbl_name !== undefined) menu.tbl_name = tbl_name;

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
        if (error.code === 11000) {
            let errorMessage = "Un élément avec cet identifiant ou cet ordre existe déjà.";
            if (error.keyPattern && error.keyPattern.ordre) {
                errorMessage = "Cet ordre d'affichage est déjà utilisé pour ce parent. Veuillez en choisir un autre.";
            } else if (error.keyPattern && error.keyPattern.designation) {
                errorMessage = "Cette désignation de menu existe déjà.";
            }
            return res.status(409).json({
                status: false,
                message: errorMessage,
                data: {}
            });
        }
        res.status(400).json({ 
            status: false,
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

