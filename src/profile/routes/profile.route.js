const express = require('express');
const { registerProfile, getProfileListe, getProfileInfo, updateProfile, deleteProfile } = require('../controllers/profile.controller');
const router = express.Router();

// Configuration de multer pour la gestion des fichiers
router.post('/v1/add', registerProfile); // Add
router.get('/v1/profiles', getProfileListe); // GET PROFILE LISTE
router.get('/v1/profile/:code_profile', getProfileInfo); // GET PROFILE INFO :code_profile
router.put('/v1/update/profile', updateProfile); // MISE A JOUR 
router.delete('/v1/delete/:code_profile', deleteProfile); // MISE A JOUR 

module.exports = router;
