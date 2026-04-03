const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { verifyApiKey } = require('../middlewares/authMiddleware');

const adminRoute = require('./admin/routes/admin.route');
const profileRoute = require('./profile/routes/profile.route');
const inputRoute = require('./inputs/routes/input.route');
const menuRoute = require('./menu/routes/menu.route');
const storeRoute = require('./store/routes/store.route');
const privilegeRoute = require('./privilege/routes/privilege.route');
const dossierRoute = require('./dossier/routes/dossier.routes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Api-Key'] // Autorise ton header personnalisé
}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(verifyApiKey);



// Routes
app.use('/api/admin', adminRoute); // ROUTES ADMINISTRATEUR
app.use('/api/profile', profileRoute); // ROUTES PROFILE
app.use('/api/privilege', privilegeRoute); // ROUTES PRIVILEGE ROUTES
app.use('/api/input', inputRoute); // ROUTES CHAMP
app.use('/api/menu', menuRoute); // ROUTES MENU
app.use('/api/store', storeRoute); // ROUTES MENU
app.use('/api/dossier/v1', dossierRoute); // ROUTES DOSSIER

// Route par défaut
app.get('/', (req, res) => {
    res.send('AKWABA sur l\'API transit V1 !');
});

module.exports = app;
