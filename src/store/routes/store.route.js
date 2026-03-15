const express = require('express');
const { registerDynamique, getOneDynamique, getDynamiqueInfoByMenu, getDynamiqueListe, updateDynamqique, deleteDynamque } = require('../controllers/store.controller');
const router = express.Router();

router.post('/v1/add', registerDynamique); // Add
router.get('/v1/dynamiques', getDynamiqueListe); // GET LISTE
router.get('/v1/dynamique/:code_dynamique/:menu', getOneDynamique); // GET INFO :code_dynamique
router.get('/v1/dynamqueData/:menu', getDynamiqueInfoByMenu); // GET INFO :menu
router.put('/v1/update/dynamqique', updateDynamqique); // MISE A JOUR 
router.delete('/v1/dynamique/:code_dynamique/:menu', deleteDynamque); // GENERATION

module.exports = router;

