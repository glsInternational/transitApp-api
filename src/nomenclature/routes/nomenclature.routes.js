const express = require('express');
const router = express.Router();
const nomenclatureController = require('../controllers/nomenclature.controller');
const auditController = require('../controllers/audit.controller');

/**
 * Routes de Nomenclature Douanière v1
 */

// Recherche exacte par code (supporte codes 2017 et 2022)
router.get('/v1/byCode/:code', nomenclatureController.getByCode);

// Recherche globale (auto-complétion, recherche par libellé ou code partiel)
router.get('/v1/search', nomenclatureController.search);

// Audit de conformité d'un dossier complet
router.get('/v1/audit/:codeDossier', auditController.auditDossier);

module.exports = router;
