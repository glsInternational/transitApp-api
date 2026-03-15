const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const { Administrateur } = require('../models/admin.model');


// Inscription
exports.registerUser = async (req, res) => {
    try {
        const { nom, email, password, telephone, genre, type_compte, profile  } = req.body;

        const existingUser = await Administrateur.findOne({ email: email, corbeille: '0' });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new Administrateur({ nom, email, password: hashedPassword, telephone, genre, type_compte, profile });

        await user.save();
        
        // Conversion de l'utilisateur en objet et suppression du mot de passe
        const userResponse = await user.formatResponse();

        // Réponse avec l'utilisateur sans le mot de passe
        res.status(201).json({
            status: true,
            message: 'Utilisateur enregistré avec succès.',
            data: userResponse,
        });
    } catch (error) {
        res.status(500).json({ 
            status: true,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

// Connexion
exports.loginUser = async (req, res) => {
    try {
        const { login, password } = req.body;

        const user = await Administrateur.findOne({
            $or: [
                { email: login.toLowerCase() },
                { telephone: login }
            ],
            corbeille: '0'
        });

        if (!user) {
            return res.status(401).json({ 
                status: false, 
                message: 'Identifiants (Email/Téléphone) ou mot de passe incorrects.' 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                status: false, 
                message: 'Identifiants ou mot de passe incorrects.' 
            });
        }

        // Gestion des statuts (Attente / Suspendu)
        if (user.status === '0') {
            return res.status(403).json({ status: false, message: 'Votre compte est en attente de validation.' });
        }
        if (user.status === '-1') {
            return res.status(403).json({ status: false, message: 'Votre compte est suspendu.' });
        }

        // --- MISE À JOUR DU STATUT DE PREMIÈRE CONNEXION ---
        if (user.status_first_connexion === '0') {
            user.status_first_connexion = '1';
            await user.save(); // On sauvegarde la modification en base
        }
        // --------------------------------------------------

        // Récupération des données formatées
        const userResponse = await user.formatResponse();

        res.status(200).json({ 
            status: true,
            message: 'Connexion réussie.',
            data: userResponse
        });

    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: "Erreur serveur : " + error.message, 
            data: {}
        });
    }
};

//GET ALL
exports.getAdminList = async (req, res) => {
    try {
        // Récupérer tous les profils
        const administrateurs = await Administrateur.find({ corbeille: "0" });

        // Supprimer les informations sensibles pour chaque profil
        const administrateurResponse = await Promise.all(
            administrateurs.map(async (administrateur, index) => {
                const formattedResponse = await administrateur.formatResponse();
                return {
                    ...formattedResponse,
                    position: index + 1 // Ajoute la position en commençant par 1
                };
            })
        );

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: administrateurResponse
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: []
        });
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        const token = req.params.token;

        const user = await Administrateur.findOne({ token: token, corbeille: "0" });
        if (!user) {
            return res.status(404).json({ 
                status: false,
                message: 'Utilisateur non trouvé.',
                data: {}
            });
        }

        // Supprimer les informations sensibles
        const userResponse = await user.formatResponse();

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

// Mise à jour de compte
exports.updateAccompteUser = async (req, res) => {
    try {
        // const { userId } = req.params;
        const { token, nom, email, password, telephone, genre, type_compte, profile, status  } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await Administrateur.findOne({token:token});
        if (!user) {
            return res.status(404).json({ 
                status: false,
                message: 'Utilisateur non trouvé.',
                data: {}
            });
        }

        // Mettre à jour les champs modifiables
        if (nom) user.nom = nom;
        if (genre) user.genre = genre;
        if (telephone) user.telephone = telephone;
        if (profile) user.profile = profile;
        if (type_compte) user.type_compte = type_compte;
        if (status) user.status = status;

        if (email) {
            // Vérifier si l'email est déjà utilisé par un autre utilisateur
            const existingUser = await Administrateur.findOne({ email : email, token: { $ne: token } });
            if (existingUser) {
                return res.status(400).json({ 
                    status: false,
                    message: 'Cette adresse mail est déjà utilisée par un autre utilisateur.',
                    data: {}
                });
            }
            user.email = email;
        }

        // Si un nouveau mot de passe est fourni, le hacher
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Enregistrer les modifications
        await user.save();

        // Supprimer le mot de passe des données de la réponse
        const userResponse = await user.formatResponse();

        res.status(200).json({
            status: true,
            message: 'Utilisateur mis à jour avec succès.',
            data: userResponse
        });
    } catch (error) {
        res.status(400).json({ 
            status: true,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const token = req.params.token;
        const file = req.file; // Récupérer le fichier envoyé

        // Trouver l'utilisateur
        const user = await Administrateur.findOne({ token: token });
        if (!user) {
            return res.status(404).json({
                status: true,
                message: 'Utilisateur non trouvé.',
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

        // Vérifier si un fichier de profile précédent existe et le supprimer
        if (user.photo_profile && user.photo_profile.filename) {
            const oldFilePath = path.join(rootDir, `/uploads/profile/${user.photo_profile.filename}`);
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
        const filename = `admin_${Date.now()}-${file.originalname}`;
        const filepath = path.join(uploadDir, filename);

        // Déplacer le fichier vers le répertoire de destination
        fs.writeFileSync(filepath, file.buffer);

        // Construire le chemin complet pour l'URL
        const baseUrl = process.env.BASE_URL || "http://localhost"; // Utiliser une URL dynamique pour local/production
        const fileUrl = `${baseUrl}/uploads/profile/${filename}`;

        // Mettre à jour les informations de profil dans la base de données
        user.photo_profile = {
            filename: filename,
            filetype: file.mimetype,
            filepath: fileUrl
        };

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Photo de profil mise à jour avec succès.',
            data: user.photo_profile
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

exports.deleteAdmin = async (req, res) => {
    try {
        const token = req.params.token;

        const user = await Administrateur.findOne({ token });
        if (!user) {
            return res.status(404).json({ 
                status: false,
                message: 'Utilisateur non trouvé.',
                data: {}
            });
        }

        //Mettre le compte dans la corbeille
        user.corbeille = "1";

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Succès.',
            data: {}
        });
    } catch (error) {
        res.status(500).json({ 
            status: false,
            message: error.message || 'Une erreur interne est survenue.',
            data: {}
        });
    }
};



