const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossier.controller');
const { verifyJWT } = require('../../../middlewares/jwtMiddleware');

// Sécuriser toutes les routes dossier avec JWT
router.use(verifyJWT);

// CRUD DOSSIERS
router.post('/add', dossierController.registerDossier);
router.get('/dossiers', dossierController.getDossierListe);
router.get('/dossier/:code_dossier', dossierController.getDossierInfo);
router.get('/regimes', dossierController.getRegimes);
router.put('/update', dossierController.updateDossier);
router.put('/update-operation', dossierController.updateOperation);
router.delete('/delete/:code_dossier', dossierController.deleteDossier);
router.get('/corbeille', dossierController.getDossiersCorbeille);
router.put('/restore/:code_dossier', dossierController.restoreDossier);

// WORKFLOW & ETATS
router.get('/etat-dossiers', dossierController.getEtatDossiers);
router.post('/etat-dossiers', dossierController.createEtatDossier);
router.put('/etat-dossiers/:id', dossierController.updateEtatDossier);
router.post('/change-status', dossierController.changeDossierStatus);
router.delete('/remove-intervenant', dossierController.removeIntervenant);

module.exports = router;
