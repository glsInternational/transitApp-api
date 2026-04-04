const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');
const { TarifDouanier } = require('../dossier/models/tarif.model');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../config/connection');

const SOURCE_FILE = 'docs/le_tec_cedeao_enrichi_des_principaux_droits_et_taxes_relevant_de_la_taxation_nationale_-_27-03-2026.txt';

async function seedTarifs() {
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
        let currentRecord = null;
        let bufferLibelle = [];

        console.log("Démarrage de l'analyse du fichier...");

        for await (let line of rl) {
            // Ignorer les entêtes de page et lignes vides
            if (!line.trim() || line.includes('TEC CEDEAO 2022') || line.includes('Page ') || line.includes('N°    CODE SH')) {
                continue;
            }

            // Détection d'une nouvelle ligne de code SH
            // Format : N° (optionnel) + Code SH (10 chiffres)
            const match = line.match(/^(\s*\d+)?\s+(\d{10})/);

            if (match) {
                // Si on a un record en cours, on le sauvegarde
                if (currentRecord) {
                    currentRecord.libelle = bufferLibelle.join(' ').replace(/\s+/g, ' ').trim();
                    await saveRecord(currentRecord);
                    count++;
                    if (count % 100 === 0) console.log(`${count} articles importés...`);
                }

                // Initialisation du nouveau record
                const code_sh = match[2];
                // Extraction du libelle sur la même ligne (tout ce qui est entre le code et les taxes)
                // Les taxes commencent vers la colonne 60
                const descPart = line.substring(line.indexOf(code_sh) + code_sh.length, 60).trim();
                
                // Extraction des taxes par colonnes fixes
                currentRecord = {
                    code_sh: code_sh,
                    dd: parseTax(line.substring(57, 65)),
                    tva: parseTax(line.substring(72, 80)),
                    pcc: parseTax(line.substring(104, 108)),
                    pcs: parseTax(line.substring(108, 112)),
                    pua: parseTax(line.substring(112, 116)),
                    rst: parseTax(line.substring(120, 126))
                };
                
                bufferLibelle = [];
                if (descPart) bufferLibelle.push(descPart);
            } else {
                // Ligne de description continue
                // On s'assure que ce n'est pas une ligne de taxes orpheline (peu probable vu le format)
                const trimmed = line.trim();
                if (trimmed && currentRecord) {
                    // Si la ligne commence par beaucoup d'espaces, c'est probablement une suite de libelle
                    // Si elle contient des chiffres espacés au milieu, c'est peut-être des taxes (mais normalement elles sont sur la ligne du code SH)
                    if (line.substring(0, 50).trim()) {
                        bufferLibelle.push(line.substring(0, 60).trim());
                    }
                }
            }
        }

        // Sauvegarde du dernier record
        if (currentRecord) {
            currentRecord.libelle = bufferLibelle.join(' ').replace(/\s+/g, ' ').trim();
            await saveRecord(currentRecord);
            count++;
        }

        console.log(`Seeding terminé ! Total : ${count} nomenclatures importées.`);
        process.exit(0);
    } catch (error) {
        console.error("Erreur fatale lors du seeding:", error);
        process.exit(1);
    }
}

function parseTax(val) {
    if (!val) return 0;
    const clean = val.trim().replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}

async function saveRecord(record) {
    await TarifDouanier.findOneAndUpdate(
        { code_sh: record.code_sh },
        { 
            $set: {
                libelle: record.libelle,
                dd: record.dd,
                tva: record.tva,
                pcc: record.pcc,
                pcs: record.pcs,
                pua: record.pua,
                rst: record.rst,
                status: '1'
            }
        },
        { upsert: true, new: true }
    );
}

seedTarifs();
