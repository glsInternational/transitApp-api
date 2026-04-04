const {Menu} = require('../models/menu.model');
const { fetchOneValue } = require('../../../services/requetes');
const { logAction } = require('../../audit/services/audit.service');


// ADD Menu
exports.registerMenu = async (req, res) => {
    try {
        const { designation, type, route, svg, ordre, commentaire, parent, tbl_name } = req.body;

        const menu = new Menu({  designation, type, route, svg, ordre, commentaire, parent, tbl_name });

        await menu.save();

        // --- AUDIT ---
        await logAction(req, 'CREATE', 'MENU', { designation, route, parent });
        
        // On réordonne pour s'assurer que l'ordre est propre (au cas où on insère au milieu)
        await reorderMenusByParent(menu.parent);

        // Récupérer tous les menus
        const menus = await Menu.find();

        const menuResponse = menus.map((menu, index) => ({
            ...menu.formatResponse(),
            position: index + 1, 
        }));

        res.status(201).json({
            status: true,
            message: 'Menu enregistré avec succès.',
            data: menuResponse,
        });
    } catch (error) {
        if (error.code === 11000) {
            let errorMessage = "Un élément avec cet identifiant ou cet ordre existe déjà.";
            if (error.keyPattern && error.keyPattern.ordre) {
                errorMessage = "Cet ordre d'affichage est déjà utilisé pour ce parent.";
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

        let menusFound = await Menu.find({ 
            code_menu: { $in: cleanMenuCodes } 
        }).sort({ ordre: 1 });

        const parentCodes = [...new Set(menusFound.map(m => m.parent).filter(p => p && p !== ""))];
        if (parentCodes.length > 0) {
            const missingParents = await Menu.find({
                code_menu: { 
                    $in: parentCodes, 
                    $nin: menusFound.map(m => m.code_menu) 
                }
            });
            menusFound = [...menusFound, ...missingParents];
        }

        let menuResponse = menusFound.map((menuItem, index) => ({
            ...menuItem.formatResponse(),
            position: index + 1
        }));

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
        const menus = await Menu.find().sort({ parent: 1, ordre: 1 });

        const menuResponse = menus.map((menu, index) => ({
            ...menu.formatResponse(),
            position: index + 1,
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

// Helper pour réordonner les menus d'un parent (1, 2, 3...) de manière propre et séquentielle
const reorderMenusByParent = async (parent) => {
    const parentFilter = parent || "";
    
    // On récupère tous les menus actifs pour ce parent
    const menus = await Menu.find({ parent: parentFilter, corbeille: "0" });
    
    // On trie numériquement en JavaScript pour éviter les problèmes de tri alphabetique de chaîne ("10" < "2")
    menus.sort((a, b) => {
        const orderA = parseInt(a.ordre) || 999;
        const orderB = parseInt(b.ordre) || 999;
        
        if (orderA !== orderB) return orderA - orderB;
        
        // En cas d'ordre identique (ex: pendant une modification), on se base sur la date de création
        return new Date(a.createdAt) - new Date(b.createdAt);
    });
    
    // On réaffecte l'ordre de 1 à N de manière séquentielle
    for (let i = 0; i < menus.length; i++) {
        const newOrder = (i + 1).toString();
        // Si l'ordre en base est déjà correct, on ne fait rien
        if (menus[i].ordre !== newOrder) {
            await Menu.updateOne({ _id: menus[i]._id }, { $set: { ordre: newOrder } });
        }
    }
};


// Mise A JOUR DU Menu
exports.updateMenu = async (req, res) => {
    try {
        const { designation, type, route, svg, ordre, commentaire, code_menu, parent, tbl_name } = req.body;

        const menu = await Menu.findOne({ code_menu: code_menu });
        if (!menu) {
            return res.status(404).json({ status: false, message: 'Menu non trouvé.', data: {} });
        }

        const oldParent = menu.parent || "";
        const parentChanged = parent !== undefined && parent !== oldParent;

        if (designation !== undefined) menu.designation = designation;
        if (type !== undefined) menu.type = type;
        if (route !== undefined) menu.route = route;
        if (svg !== undefined) menu.svg = svg;
        if (ordre !== undefined) menu.ordre = ordre;
        if (commentaire !== undefined) menu.commentaire = commentaire;
        if (parent !== undefined) menu.parent = parent; 
        if (tbl_name !== undefined) menu.tbl_name = tbl_name;

        menu.__v = menu.__v + 1;
        await menu.save();

        // --- AUDIT ---
        await logAction(req, 'UPDATE', 'MENU', { code_menu, designation, route, parent, old_parent: oldParent });

        // Réordonner les anciens et nouveaux parents si nécessaire
        await reorderMenusByParent(menu.parent);
        if (parentChanged) {
            await reorderMenusByParent(oldParent);
        }

        const menuResponse = menu.formatResponse(menu);

        res.status(200).json({
            status: true,
            message: 'Menu mis à jour et ordres synchronisés.',
            data: menuResponse
        });
    } catch (error) {
        if (error.code === 11000) {
            let errorMessage = "Un élément avec cet identifiant ou cet ordre existe déjà.";
            if (error.keyPattern && error.keyPattern.ordre) {
                errorMessage = "Cet ordre d'affichage est déjà utilisé pour ce parent.";
            } else if (error.keyPattern && error.keyPattern.designation) {
                errorMessage = "Cette désignation de menu existe déjà.";
            }
            return res.status(409).json({ status: false, message: errorMessage, data: {} });
        }
        res.status(400).json({ status: false, message: error.message || 'Une erreur interne est survenue.', data: {} });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const code_menu = req.params.code_menu;
        const menu = await Menu.findOne({ code_menu: code_menu });
        
        if (!menu) {
            return res.status(404).json({ status: false, message: 'Menu non trouvé.', data: {} });
        }

        const parentOfDeleted = menu.parent || "";
        await Menu.deleteOne({ code_menu: code_menu });

        // --- AUDIT ---
        await logAction(req, 'DELETE', 'MENU', { code_menu: code_menu, designation: menu.designation });

        // Compacter l'ordre du parent après suppression
        await reorderMenusByParent(parentOfDeleted);

        return res.status(200).json({
            status: true,
            message: 'Menu supprimé et ordres compactés.',
            data: menu
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message || 'Une erreur interne est survenue.', data: {} });
    }
};

// GET NEXT ORDRE
exports.getNextOrder = async (req, res) => {
    try {
        const { parent } = req.query;
        const parentFilter = parent ? parent : "";
        
        const menus = await Menu.find({ parent: parentFilter, corbeille: "0" });
        
        let nextOrder = 1;
        if (menus.length > 0) {
            const orders = menus.map(m => parseInt(m.ordre) || 0);
            nextOrder = Math.max(...orders) + 1;
        }

        res.status(200).json({
            status: true,
            data: nextOrder.toString()
        });
    } catch (error) {
        res.status(500).json({ 
            status: false, 
            message: error.message || 'Erreur lors du calcul de l\'ordre.',
            data: "1"
        });
    }
};
