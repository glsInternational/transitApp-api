const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
const { TarifDouanier } = require('../dossier/models/tarif.model');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../config/connection');

const SOURCE_FILE = 'docs/concordance_des_positions_qui_existent_dans_le_sh_2017_mais_qui_ne_figurent_pas_dans_le_sh_2022_23-0.txt';

async function seedConcordance() {
    try {
        let dbUrl;
        if (DB_MONGO_USER && DB_MONGO_PASSWORD) {
            dbUrl = `mongodb://${DB_MONGO_USER}:${DB_MONGO_PASSWORD}@${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`;
        } else {
            dbUrl = `mongodb://${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}`;
        }

        console.log(`Connexion à MongoDB (${MONGO_DATABASE})...`);
        await mongoose.connect(dbUrl);

        const fileStream = fs.createReadStream(SOURCE_FILE);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let count = 0;
        console.log("Analyse du fichier de concordance SH 2017 -> 2022...");

        for await (let line of rl) {
            // Ignorer les entêtes
            if (!line.trim() || line.includes('CONCORDANCE DES POSITIONS') || line.includes('Page ')) {
                continue;
            }

            // Chercher deux codes (le code 2017 est au début, le code 2022 est plus loin)
            // Note: Certains codes peuvent être à 9 chiffres si le premier 0 a sauté
            const matches = [...line.matchAll(/\s(\d{9,10})\s/g)];
            
            if (matches.length >= 2) {
                let code2017 = matches[0][1].padStart(10, '0');
                let code2022 = matches[1][1].padStart(10, '0');

                // Si le deuxième match est en réalité un taux (ex: "10"), on cherche le suivant
                // Mais ici les codes SH font au moins 9 chiffres.
                
                // Mettre à jour le record 2022 avec son historique 2017
                const result = await TarifDouanier.updateOne(
                    { code_sh: code2022 },
                    { 
                        $addToSet: { 
                            historical_mappings: { 
                                code_sh_2017: code2017,
                                libelle_2017: "Importé via concordance" 
                            } 
                        } 
                    }
                );

                if (result.modifiedCount > 0) {
                    count++;
                    if (count % 100 === 0) console.log(`${count} concordances liées...`);
                }
            }
        }

        console.log(`Concordance terminée ! ${count} mappings historisés.`);
        process.exit(0);
    } catch (error) {
        console.error("Erreur concordance:", error);
        process.exit(1);
    }
}

seedConcordance();
