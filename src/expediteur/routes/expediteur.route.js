const express = require('express');
const router = express.Router();
const expediteurController = require('../controllers/expediteur.controller');

/**
 * Routes des Expéditeurs v1
 */

router.get('/v1/expediteurs', expediteurController.getExpediteurListe);
router.post('/v1/add', expediteurController.registerExpediteur);
router.put('/v1/update', expediteurController.updateExpediteur);
router.delete('/v1/delete/:id', expediteurController.deleteExpediteur);

module.exports = router;
