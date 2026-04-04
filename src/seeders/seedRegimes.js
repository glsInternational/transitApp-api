const mongoose = require('mongoose');
const { RegimeDouanier } = require('../dossier/models/regime.model');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../config/connection');

const regimes = [
    { code: "1000", libelle: "Exportation définitive", type: "definitif" },
    { code: "2200", libelle: "Perfectionnement passif", type: "suspensif" },
    { code: "3000", libelle: "Réexportation directe", type: "suspensif" },
    { code: "4000", libelle: "Mise à la consommation directe", type: "definitif" },
    { code: "5000", libelle: "Admission temporaire ordinaire", type: "suspensif" },
    { code: "7000", libelle: "Entrée en entrepôt de stockage", type: "suspensif" },
    { code: "8000", libelle: "Transit", type: "suspensif" },
    { code: "D3", libelle: "Mise à la consommation (Import TTC)", type: "definitif" },
    { code: "D18", libelle: "Entrepôt de stockage / Admission Temporaire", type: "suspensif" },
    { code: "D56", libelle: "Admission temporaire / Matériel pro", type: "suspensif" },
    { code: "S106", libelle: "Exportation temporaire", type: "suspensif" }
];

async function seedRegimes() {
    try {
        let dbUrl;
        if (DB_MONGO_USER && DB_MONGO_PASSWORD) {
            dbUrl = `mongodb://${DB_MONGO_USER}:${DB_MONGO_PASSWORD}@${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`;
        } else {
            dbUrl = `mongodb://${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}`;
        }

        console.log(`Connexion à MongoDB (${MONGO_DATABASE})...`);
        await mongoose.connect(dbUrl);
        
        console.log("Seeding des régimes douaniers...");

        for (const r of regimes) {
            await RegimeDouanier.findOneAndUpdate(
                { code: r.code },
                { 
                    $set: {
                        libelle: r.libelle,
                        type: r.type,
                        status: '1'
                    }
                },
                { upsert: true, new: true }
            );
            console.log(`Régime ${r.code} synchronisé.`);
        }

        console.log("Seeding des régimes douaniers terminé avec succès !");
        process.exit(0);
    } catch (error) {
        console.error("Erreur seeding:", error);
        process.exit(1);
    }
}

seedRegimes();

