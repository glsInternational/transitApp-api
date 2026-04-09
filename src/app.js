const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { verifyApiKey } = require('../middlewares/authMiddleware');

const adminRoute = require('./admin/routes/admin.route');
const paysRoute = require('./pays/routes/pays.route');
const clientRoute = require('./client/routes/client.route');
const profileRoute = require('./profile/routes/profile.route');
const inputRoute = require('./inputs/routes/input.route');
const menuRoute = require('./menu/routes/menu.route');
const storeRoute = require('./store/routes/store.route');
const privilegeRoute = require('./privilege/routes/privilege.route');
const dossierRoute = require('./dossier/routes/dossier.routes');
const statsRoute = require('./stats/stats.routes');
const notificationRoute = require('./notification/routes/notification.routes');
const invoiceRoute = require('./invoice/routes/invoice.routes');
const nomenclatureRoute = require('./nomenclature/routes/nomenclature.routes');
const deviseRoute = require('./devise/routes/devise.route');
const expediteurRoute = require('./expediteur/routes/expediteur.route');
const typeDepenseRoute = require('./type_depense/routes/type_depense.routes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Api-Key', 'Authorization'] // Autorise ton header personnalisé et le JWT
}));

// Route par défaut
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'AKWABA sur l\'API transit V1 !',
        version: '1.0.0',
        status: 'active'
    });
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(verifyApiKey);

// Routes
app.use('/api/admin', adminRoute); // ROUTES ADMINISTRATEUR
app.use('/api/pays', paysRoute); // ROUTES PAYS
app.use('/api/client', clientRoute); // ROUTES CLIENTS
app.use('/api/profile', profileRoute); // ROUTES PROFILE
app.use('/api/privilege', privilegeRoute); // ROUTES PRIVILEGE ROUTES
app.use('/api/input', inputRoute); // ROUTES CHAMP
app.use('/api/menu', menuRoute); // ROUTES MENU
app.use('/api/store', storeRoute); // ROUTES MENU
app.use('/api/dossier/v1', dossierRoute); // ROUTES DOSSIER
app.use('/api/stats', statsRoute); // ROUTES STATS GLOBALES
app.use('/api/notification', notificationRoute); // ROUTES NOTIFICATIONS
app.use('/api/invoice', invoiceRoute); // ROUTES FACTURES
app.use('/api/nomenclature', nomenclatureRoute); // ROUTES NOMENCLATURE / TEC CEDEAO
app.use('/api/devise', deviseRoute); // ROUTES DEVISES
app.use('/api/expediteur', expediteurRoute); // ROUTES EXPEDITEURS
app.use('/api/type_depense', typeDepenseRoute); // ROUTES TYPES DEPENSES

module.exports = app;
