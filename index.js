const app = require('./src/app');
const dotenv = require('dotenv');
const {connectDB} = require('./src/config/db');

dotenv.config();

//connection de la bd
connectDB();

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
