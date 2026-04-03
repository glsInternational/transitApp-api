const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossier.controller');

// CRUD DOSSIERS
router.post('/add', dossierController.registerDossier);
router.get('/dossiers', dossierController.getDossierListe);
router.get('/dossier/:code_dossier', dossierController.getDossierInfo);
router.put('/update', dossierController.updateDossier);
router.delete('/delete/:code_dossier', dossierController.deleteDossier);

module.exports = router;
