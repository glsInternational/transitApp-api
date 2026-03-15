const express = require('express');
const { registerMenu, getMenuInfo, getMenuListe, updateMenu, deleteMenu, getMenuByProfile } = require('../controllers/menu.controller');
const router = express.Router();

router.post('/v1/add', registerMenu); // Add
router.get('/v1/menus', getMenuListe); // GET LISTE
router.get('/v1/menu/:code_menu', getMenuInfo); // GET INFO :code_menu
router.get('/v1/menuByProfil/:profil', getMenuByProfile); // GET INFO :code_menu
router.put('/v1/update/menu', updateMenu); // MISE A JOUR 
router.delete('/v1/delete/:code_menu', deleteMenu); // MISE A JOUR 

module.exports = router;
