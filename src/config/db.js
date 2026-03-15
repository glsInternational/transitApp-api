
const mongoose = require('mongoose');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('./connection');

let dbUrl;

if (DB_MONGO_USER && DB_MONGO_PASSWORD) {
    dbUrl = `mongodb://${DB_MONGO_USER}:${DB_MONGO_PASSWORD}@${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`;
} else {
    // Sinon, on utilise l'URL simple (Cas local par défaut)
    dbUrl = `mongodb://${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}`;
}
const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log('MongoDB connecté avec succès.');
    } catch (error) {
        console.error('Erreur de connexion à MongoDB :', error);
        process.exit(1); // Arrête le serveur en cas d'erreur critique
    }
};


module.exports.connectDB = connectDB;

