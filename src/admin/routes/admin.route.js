const express = require('express');
const multer = require('multer');
const { registerUser, loginUser, updateAccompteUser, getAdminList, getUserInfo, updateUserProfile, deleteAdmin, getAuditLogs } = require('../controllers/admin.controller');
const { verifyJWT } = require('../../../middlewares/jwtMiddleware');
const router = express.Router();

// Configuration de multer pour la gestion des fichiers
const storage = multer.memoryStorage(); // Stocke temporairement en mémoire
const upload = multer({ storage: storage });

router.post('/v1/login', loginUser);       // Connexion (Publique)

// --- ROUTES PROTÉGÉES PAR JWT ---
router.use(verifyJWT);

router.post('/v1/register', registerUser); 
router.get('/v1/user/me', getUserInfo); // RÉCUPÉRER MOI 
router.get('/v1/user/:token', getUserInfo); 
router.get('/v1/admin', getAdminList); 
router.put('/v1/update/compte', updateAccompteUser); // MISE A JOUR ADMINISTRATEUR
router.put('/v1/update/profile/:token', upload.single('photo_profile'), updateUserProfile); // MISE A JOUR PHOTO_PROFILE
router.delete('/v1/admin/:token', deleteAdmin); // SUPPRESSION ADMINISTRATEUR
router.get('/v1/audit', getAuditLogs); // RÉCUPÉRATION DES LOGS D'AUDIT


module.exports = router;
