const mongoose = require('mongoose');
const { TarifDouanier } = require('../src/dossier/models/tarif.model');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../src/config/connection');

async function verify() {
    try {
        let dbUrl;
        if (DB_MONGO_USER && DB_MONGO_PASSWORD) {
            dbUrl = `mongodb://${DB_MONGO_USER}:${DB_MONGO_PASSWORD}@${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`;
        } else {
            dbUrl = `mongodb://${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}`;
        }
        await mongoose.connect(dbUrl);
        
        const count = await TarifDouanier.countDocuments();
        console.log(`Total nomenclatures: ${count}`);
        
        const historical = await TarifDouanier.countDocuments({ "historical_mappings.0": { $exists: true } });
        console.log(`Articles avec historique 2017: ${historical}`);
        
        const sample = await TarifDouanier.findOne({ code_sh: "0202300000" });
        console.log("Exemple (0202300000):", JSON.stringify(sample, null, 2));
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
verify();
