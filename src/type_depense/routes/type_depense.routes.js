const express = require('express');
const router = express.Router();
const typeDepenseController = require('../controllers/type_depense.controller');
const { verifyToken } = require('../../../utils/utils');

router.post('/', typeDepenseController.createTypeDepense);
router.get('/', typeDepenseController.getTypeDepenses);
router.put('/:id', typeDepenseController.updateTypeDepense);
router.delete('/:id', typeDepenseController.deleteTypeDepense);

module.exports = router;
