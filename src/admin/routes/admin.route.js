const express = require('express');
const multer = require('multer');
const { registerUser, loginUser, updateAccompteUser, getAdminList, getUserInfo, updateUserProfile, deleteAdmin } = require('../controllers/admin.controller');
const router = express.Router();

// Configuration de multer pour la gestion des fichiers
const storage = multer.memoryStorage(); // Stocke temporairement en mémoire
const upload = multer({ storage: storage });

router.post('/v1/register', registerUser); // Inscription administrateur
router.post('/v1/login', loginUser);       // Connexion administrateur
router.get('/v1/user/:token', getUserInfo); // GET ADMINSITRATEUR INFO :TOKEN
router.get('/v1/admin', getAdminList); // GET ADMINSITRATEURS
router.put('/v1/update/compte', updateAccompteUser); // MISE A JOUR ADMINISTRATEUR
router.put('/v1/update/profile/:token', upload.single('photo_profile'), updateUserProfile); // MISE A JOUR PHOTO_PROFILE ADMINISTRATEUR
router.delete('/v1/admin/:token', deleteAdmin); // MISE A JOUR PHOTO_PROFILE ADMINISTRATEUR


module.exports = router;
