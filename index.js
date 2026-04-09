const dotenv = require('dotenv');
// Charger les variables le plus tôt possible !
dotenv.config();

const app = require('./src/app');
const {connectDB} = require('./src/config/db');

//connection de la bd
connectDB();

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
