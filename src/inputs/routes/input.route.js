const express = require('express');
const { registerChamp, getChampInfo, getChampInfoByMenu, getChampListe, updateChamp, generationId, deleteChamp } = require('../controllers/champ.controller');
const router = express.Router();

router.post('/v1/add', registerChamp); // Add
router.get('/v1/input', getChampListe); // GET LISTE
router.get('/v1/input/:code_champ', getChampInfo); // GET INFO :code_champ
router.get('/v1/inputBypMenu/:menu', getChampInfoByMenu); // GET INFO :menu
router.put('/v1/update/input', updateChamp); // MISE A JOUR 
router.post('/v1/generationId', generationId); // GENERATION
router.delete('/v1/delete/:code_champ', deleteChamp); // GENERATION

module.exports = router;
