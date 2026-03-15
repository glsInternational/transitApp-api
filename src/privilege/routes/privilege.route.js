const express = require('express');
const { registerDroitProfile, getDroitProfileListe, getDroitProfileInfo, updateDroitProfile, deleteDroitProfile } = require('../controllers/privilege.controller');
const router = express.Router();


router.post('/v1/add', registerDroitProfile); // Add
router.get('/v1/droits', getDroitProfileListe); // GET PROFILE LISTE
router.get('/v1/droit/:code_droit', getDroitProfileInfo); // GET PROFILE INFO :code_droit
router.put('/v1/update/droit', updateDroitProfile); // MISE A JOUR 
router.delete('/v1/droit/:code_droit', deleteDroitProfile); // MISE A JOUR 

module.exports = router;
