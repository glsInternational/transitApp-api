const {Droit} = require('../models/privilege.model');


// ADD PROFILE
exports.registerDroitProfile = async (req, res) => {
    try {
        const { profil, menuList, commentaire } = req.body;

        const existingProfile = await Droit.findOne({profil:profil});
        if (existingProfile) {
            return res.status(400).json({ message: 'Ce profile à déjà des droits.' });
        }

        const profile = new Droit({ profil, menuList, commentaire });

        await profile.save();
        
        // Conversion de l'utilisateur en objet et suppression du mot de passe
        const ProfileResponse = await profile.formatResponse();

        // Réponse avec l'utilisateur sans le mot de passe
        res.status(201).json({
            status: true,
            message: 'Droits enregistré avec succès.',
            data: ProfileResponse,
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

//GET DETAILS PROFILE / code_droit
exports.getDroitProfileInfo = async (req, res) => {
    try {
        const code_droit = req.params.code_droit;

        const profile = await Droit.findOne({ code_droit: code_droit });
        if (!profile) {
            return res.status(404).json({ 
                status: false,
                message: 'Profile non trouvé.',
                data: {}
            });
        }

        // Supprimer les informations sensibles
        const profileResponse = await profile.formatResponse();

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: profileResponse
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

//GET ALL PROFILES
exports.getDroitProfileListe = async (req, res) => {
    try {
        // Récupérer tous les profils
        const profiles = await Droit.find();

        // Supprimer les informations sensibles pour chaque profil
        const profileResponse = await Promise.all(
            profiles.map(async (profile, index) => {
                const formattedResponse = await profile.formatResponse();
                return {
                    ...formattedResponse,
                    position: index + 1 // Ajoute la position en commençant par 1
                };
            })
        );

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: profileResponse
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: []
        });
    }
};

// Mise A JOUR DU PROFILE
exports.updateDroitProfile = async (req, res) => {
    try {
        const {profil, menuList, commentaire, code_droit } = req.body;

        // Vérifier si le profile existe
        const profile = await Droit.findOne({code_droit:code_droit});
        if (!profile) {
            return res.status(404).json({ 
                status: false,
                message: 'Droit non trouvé.',
                data: {}
            });
        }

        // Mettre à jour les champs modifiables
        if (profil) profile.profil = profil;
        if (menuList) profile.menuList = menuList;
        if (commentaire) profile.commentaire = commentaire;

        // Enregistrer les modifications
        await profile.save();

        // Supprimer le mot de passe des données de la réponse
        const profileResponse = await profile.formatResponse();

        res.status(200).json({
            status: true,
            message: 'Droit mis à jour avec succès.',
            data: profileResponse
        });
    } catch (error) {
        res.status(400).json({ 
            status: true,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

exports.deleteDroitProfile = async (req, res) => {
    try {
        const code_droit = req.params.code_droit;

        // Trouver le profile
        const profile = await Droit.findOne({ code_droit: code_droit });
        if (!profile) {
            return res.status(404).json({
                status: true,
                message: 'Droit non trouvé.',
                data: {}
            });
        }

        await Droit.deleteOne({ code_droit: code_droit });

        res.status(200).json({
            status: true,
            message: 'Droit supprimé avec succès.',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Une erreur interne est survenue.",
            data: {}
        });
    }
};



