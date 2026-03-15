const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const {Profile} = require('../models/profile.model');


// ADD PROFILE
exports.registerProfile = async (req, res) => {
    try {
        const { designation, actions, visibilite, type_accueil, bloc_visible, commentaire } = req.body;

        const existingProfile = await Profile.findOne({designation:designation.toLowerCase().trim()});
        if (existingProfile) {
            return res.status(400).json({ message: 'Ce profile existe déjà.' });
        }

        const profile = new Profile({ designation, actions, visibilite, type_accueil, bloc_visible, commentaire });

        await profile.save();
        
        // Conversion de l'utilisateur en objet et suppression du mot de passe
        const ProfileResponse = profile.formatResponse(profile);

        // Réponse avec l'utilisateur sans le mot de passe
        res.status(201).json({
            status: true,
            message: 'Profile enregistré avec succès.',
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

//GET DETAILS PROFILE / CODE_PROFILE
exports.getProfileInfo = async (req, res) => {
    try {
        const code_profile = req.params.code_profile;

        const profile = await Profile.findOne({ code_profile: code_profile });
        if (!profile) {
            return res.status(404).json({ 
                status: false,
                message: 'Profile non trouvé.',
                data: {}
            });
        }

        // Supprimer les informations sensibles
        const profileResponse = profile.formatResponse(profile);

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
exports.getProfileListe = async (req, res) => {
    try {
        // Récupérer tous les profils
        const profiles = await Profile.find();

        // Supprimer les informations sensibles pour chaque profil
        const profileResponse = profiles.map((profile, index) => ({
            ...profile.formatResponse(),
            position: index + 1,
        }));

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
exports.updateProfile = async (req, res) => {
    try {
        const { designation, actions, visibilite, type_accueil, bloc_visible, commentaire, code_profile } = req.body;

        // Vérifier si le profile existe
        const profile = await Profile.findOne({code_profile:code_profile});
        if (!profile) {
            return res.status(404).json({ 
                status: false,
                message: 'Profile non trouvé.',
                data: {}
            });
        }

        // Mettre à jour les champs modifiables
        if (designation) profile.designation = designation;
        if (actions) profile.actions = actions;
        if (visibilite) profile.visibilite = visibilite;
        if (type_accueil) profile.type_accueil = type_accueil;
        if (bloc_visible) profile.bloc_visible = bloc_visible;
        if (commentaire) profile.commentaire = commentaire;

        if (designation) {
            // Vérifier si l'designation: designation est déjà utilisé par un autre utilisateur
            const existingProfile = await Profile.findOne({ designation: designation , code_profile: { $ne: code_profile } });
            if (existingProfile) {
                return res.status(400).json({ 
                    status: false,
                    message: 'Cette designation est déjà utilisée.',
                    data: {}
                });
            }
            profile.designation = designation;
        }

        // Enregistrer les modifications
        await profile.save();

        // Supprimer le mot de passe des données de la réponse
        const profileResponse = profile.formatResponse(profile);

        res.status(200).json({
            status: true,
            message: 'Profile mis à jour avec succès.',
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

//PERMET DE MODIFIER L'IMAGE DE PROFILE
exports.updateProfileimage = async (req, res) => {
    try {
        const code_profile = req.params.code_profile;
        const file = req.file; // Récupérer le fichier envoyé

        // Trouver le profile
        const profile = await Profile.findOne({ code_profile: code_profile });
        if (!profile) {
            return res.status(404).json({
                status: true,
                message: 'Profile non trouvé.',
                data: {}
            });
        }

        // Vérifier si un fichier est envoyé
        if (!file) {
            return res.status(400).json({
                status: true,
                message: 'Aucun fichier envoyé.',
                data: {}
            });
        }

        // Vérifier les formats autorisés
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({
                status: false,
                message: 'Format de fichier non autorisé. Formats acceptés : jpg, jpeg, png, webp.',
                data: {}
            });
        }

        const rootDir = path.resolve(__dirname, '../../../');  // En remontant de trois niveaux

        // Vérifier si un fichier de profil précédent existe et le supprimer
        if (profile.profile && profile.profile.filename) {
            const oldFilePath = path.join(rootDir, `/uploads/profile/${profile.profile.filename}`);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath); // Supprimer l'ancien fichier
            }
        }

        // Créer le dossier d'uploads s'il n'existe pas
        const uploadDir = path.join(rootDir, '/uploads/profile');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Générer un nouveau nom de fichier unique
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(uploadDir, filename);

        // Déplacer le fichier vers le répertoire de destination
        fs.writeFileSync(filepath, file.buffer);

        // Construire le chemin complet pour l'URL
        const baseUrl = process.env.BASE_URL || "http://localhost:5000"; // Utiliser une URL dynamique pour local/production
        const fileUrl = `${baseUrl}/uploads/profile/${filename}`;

        // Mettre à jour les informations de profil dans la base de données
        profile.profile = {
            filename: filename,
            filetype: file.mimetype,
            filepath: fileUrl
        };

        await profile.save();

        res.status(200).json({
            status: true,
            message: 'Image de profile mise à jour avec succès.',
            data: profile.profile
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: error.message,
            data: {}
        });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const code_profile = req.params.code_profile;

        // Trouver le profile
        const profile = await Profile.findOne({ code_profile: code_profile });
        if (!profile) {
            return res.status(404).json({
                status: true,
                message: 'Profile non trouvé.',
                data: {}
            });
        }

        await Profile.deleteOne({ code_profile: code_profile });

        res.status(200).json({
            status: true,
            message: 'Profile supprimé avec succès.',
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



