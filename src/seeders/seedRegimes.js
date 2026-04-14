const mongoose = require('mongoose');
const { RegimeDouanier } = require('../dossier/models/regime.model');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../config/connection');

const regimes = [
    {
        "code": "1000",
        "libelle": "Exportation definitive",
        "type": "definitif"
    },
    {
        "code": "1022",
        "libelle": "Exportation definitive en suite de perfectionnement passif pr transfo",
        "type": "definitif"
    },
    {
        "code": "1023",
        "libelle": "Exportation definitive en suite de perfectionnement passif pour repara",
        "type": "definitif"
    },
    {
        "code": "1024",
        "libelle": "Exportation definitive en suite de perfectionnement passif autre",
        "type": "definitif"
    },
    {
        "code": "1052",
        "libelle": "Exportation definitive en suite de perfectionnement actif",
        "type": "definitif"
    },
    {
        "code": "1094",
        "libelle": "Exportation en régularisation de Bon Provisoire",
        "type": "definitif"
    },
    {
        "code": "2200",
        "libelle": "Perfectionnement passif pour transformation",
        "type": "suspensif"
    },
    {
        "code": "2300",
        "libelle": "Perfectionnement passif en suite de reparation",
        "type": "suspensif"
    },
    {
        "code": "2400",
        "libelle": "Perfectionnement passif autre",
        "type": "suspensif"
    },
    {
        "code": "3000",
        "libelle": "Re-exportation directe",
        "type": "suspensif"
    },
    {
        "code": "3050",
        "libelle": "Re-exportation en suite d'admission temporaire ordinaire",
        "type": "suspensif"
    },
    {
        "code": "3051",
        "libelle": "Re-exportation en suite d'admission temporaire speciale",
        "type": "suspensif"
    },
    {
        "code": "3052",
        "libelle": "Re-exportation en suite d'AT pour perfectionnement actif",
        "type": "suspensif"
    },
    {
        "code": "3070",
        "libelle": "Re-exportation en suite d'entrepot de stockage",
        "type": "suspensif"
    },
    {
        "code": "3079",
        "libelle": "Re-exportation en suite de depot",
        "type": "suspensif"
    },
    {
        "code": "3080",
        "libelle": "Re-exportation en suite de transit national",
        "type": "suspensif"
    },
    {
        "code": "3092",
        "libelle": "Re-exportation en sortie de zone franche",
        "type": "suspensif"
    },
    {
        "code": "3094",
        "libelle": "Re-exportation en régularisation de Bon Provisoire",
        "type": "suspensif"
    },
    {
        "code": "4000",
        "libelle": "Mise a la consommation directe",
        "type": "definitif"
    },
    {
        "code": "4050",
        "libelle": "Mise a la consommation en suite d'admission temporaire ordinaire",
        "type": "definitif"
    },
    {
        "code": "4051",
        "libelle": "Mise a la consommation en suite d'admission temporaire speciale",
        "type": "definitif"
    },
    {
        "code": "4052",
        "libelle": "Mise a la consommation en suite d'AT pour perfectionnement actif",
        "type": "definitif"
    },
    {
        "code": "4070",
        "libelle": "Mise a la consommation en suite d'entrepot de stockage",
        "type": "definitif"
    },
    {
        "code": "4079",
        "libelle": "Mise a la consomation en suite de depot",
        "type": "definitif"
    },
    {
        "code": "4080",
        "libelle": "Mise a la consommation en suite de transit national",
        "type": "definitif"
    },
    {
        "code": "4094",
        "libelle": "Mise à la consommation en régularisation de Bon Provisoire",
        "type": "definitif"
    },
    {
        "code": "5000",
        "libelle": "Admission temporaire ordinaire",
        "type": "suspensif"
    },
    {
        "code": "5050",
        "libelle": "Mutation d'admission temporaire ordinaire",
        "type": "suspensif"
    },
    {
        "code": "5052",
        "libelle": "Admission Temporaire Ordinaire ensuite de perfectionnement actif",
        "type": "suspensif"
    },
    {
        "code": "5070",
        "libelle": "Admission temporaire en suite d'entrepot de stockage",
        "type": "suspensif"
    },
    {
        "code": "5079",
        "libelle": "Admission temporaire ordinaire en suite de depot",
        "type": "suspensif"
    },
    {
        "code": "5080",
        "libelle": "Admission temporaire ordinaire en suite de transit national",
        "type": "suspensif"
    },
    {
        "code": "5092",
        "libelle": "Admission temporaire en suite dezone franche",
        "type": "suspensif"
    },
    {
        "code": "5094",
        "libelle": "Admission temporaire en régularisation de Bon Provisoire",
        "type": "suspensif"
    },
    {
        "code": "5100",
        "libelle": "Admission temporaire speciale (materiels d'entreprises)",
        "type": "suspensif"
    },
    {
        "code": "5150",
        "libelle": "Admission temporaire speciale en suite d'ATO",
        "type": "suspensif"
    },
    {
        "code": "5170",
        "libelle": "Admission temporaire speciale en suite d'entrepot de stockage",
        "type": "suspensif"
    },
    {
        "code": "5179",
        "libelle": "Admission temporaire speciale en suite de depot",
        "type": "suspensif"
    },
    {
        "code": "5180",
        "libelle": "Admission temporaire speciale en suite de transit national",
        "type": "suspensif"
    },
    {
        "code": "5200",
        "libelle": "AT pour perfectionnement actif (ouvraison,reparation,transformation)",
        "type": "suspensif"
    },
    {
        "code": "5250",
        "libelle": "Mutation d'ATO en ATT",
        "type": "suspensif"
    },
    {
        "code": "5252",
        "libelle": "Mutation de perfectionnement actif (ouvraison, reparation...)",
        "type": "suspensif"
    },
    {
        "code": "5270",
        "libelle": "AT pour perfectionnement actif en suite d'entrepot de stockage",
        "type": "suspensif"
    },
    {
        "code": "5279",
        "libelle": "Perfectionnement actif en suite de depot",
        "type": "suspensif"
    },
    {
        "code": "5280",
        "libelle": "Perfectionnement actif en suite de transit national",
        "type": "suspensif"
    },
    {
        "code": "5294",
        "libelle": "AT pour perfectionnement actif en régularisation de Bon Provisoire",
        "type": "suspensif"
    },
    {
        "code": "6022",
        "libelle": "Re-importation en suite de perfectionnement passif pour transformation",
        "type": "suspensif"
    },
    {
        "code": "6023",
        "libelle": "Re-importation en suite de perfectionnement passif pour reparation",
        "type": "suspensif"
    },
    {
        "code": "6024",
        "libelle": "Re-importation en suite de perfectionnement passif autre",
        "type": "suspensif"
    },
    {
        "code": "7000",
        "libelle": "Entree en entrepot de stockage",
        "type": "suspensif"
    },
    {
        "code": "7050",
        "libelle": "Entree en entrepot de stockage en suite d'AT ordinaire",
        "type": "suspensif"
    },
    {
        "code": "7051",
        "libelle": "Entree en entrepot de stockage en suite d'AT speciale",
        "type": "suspensif"
    },
    {
        "code": "7052",
        "libelle": "Entree en entrepot de stockage en suite d'AT perfectionnement actif",
        "type": "suspensif"
    },
    {
        "code": "7070",
        "libelle": "Mutation d'entrepot de stockage",
        "type": "suspensif"
    },
    {
        "code": "7079",
        "libelle": "Entrepot de stockage en suite de depot",
        "type": "suspensif"
    },
    {
        "code": "7080",
        "libelle": "Mise en entrepot en suite de transit national",
        "type": "suspensif"
    },
    {
        "code": "7094",
        "libelle": "Entrepot de stockage En Régularisation de Bon Provisoire",
        "type": "suspensif"
    },
    {
        "code": "8000",
        "libelle": "Transit national",
        "type": "suspensif"
    },
    {
        "code": "8052",
        "libelle": "Transit national en suite de perfectionnement actif",
        "type": "suspensif"
    },
    {
        "code": "8070",
        "libelle": "Transit national en suite d'entrepot de stockage",
        "type": "suspensif"
    },
    {
        "code": "8079",
        "libelle": "Transit national en suite de depot",
        "type": "suspensif"
    },
    {
        "code": "8080",
        "libelle": "Transit national par mer vers port/aeroport CI en suite de transit",
        "type": "suspensif"
    },
    {
        "code": "8100",
        "libelle": "Transbordement",
        "type": "suspensif"
    },
    {
        "code": "9100",
        "libelle": "Cabotage",
        "type": "suspensif"
    },
    {
        "code": "9200",
        "libelle": "Entree en zone franche",
        "type": "suspensif"
    },
    {
        "code": "9280",
        "libelle": "Entrée en zone franche industriel en suite de transit national",
        "type": "suspensif"
    },
    {
        "code": "9292",
        "libelle": "Mutation de zone franche",
        "type": "suspensif"
    },
    {
        "code": "9294",
        "libelle": "Entrée en zone franche en régularisation de Bon Provisoire",
        "type": "suspensif"
    },
    {
        "code": "9351",
        "libelle": "Declaration anniversaire d'AT speciale (mat. d'entreprises)",
        "type": "suspensif"
    },
    {
        "code": "9900",
        "libelle": "Déclaration Manuelle",
        "type": "suspensif"
    },
    {
        "code": "9910",
        "libelle": "Liquidation manuelle en suite d exportation",
        "type": "suspensif"
    },
    {
        "code": "9922",
        "libelle": "Liquidation manuelle en suite de perfectionnement passif pour transfor",
        "type": "suspensif"
    },
    {
        "code": "9923",
        "libelle": "Liquidation manuelle en suite de perfectionnement passif pour reparati",
        "type": "suspensif"
    },
    {
        "code": "9924",
        "libelle": "Liquidation manuelle en suite de perfectionnement passif autre",
        "type": "suspensif"
    },
    {
        "code": "9930",
        "libelle": "Liquidation manuelle en suite de reexportation",
        "type": "suspensif"
    },
    {
        "code": "9950",
        "libelle": "Liquidation manuelle en suite d'admission temporaire ordinaire",
        "type": "suspensif"
    },
    {
        "code": "9951",
        "libelle": "Liquidation Manuelle en suite d'ATME",
        "type": "suspensif"
    },
    {
        "code": "9952",
        "libelle": "Liquidation manuelle en suite de perfectionnement actif",
        "type": "suspensif"
    },
    {
        "code": "9970",
        "libelle": "Liquidation manuelle en suite d'entrepot de stockage",
        "type": "suspensif"
    },
    {
        "code": "9980",
        "libelle": "Liquidation manuelle en suite de transit national",
        "type": "suspensif"
    },
    {
        "code": "9992",
        "libelle": "Liquidation manuelle en suite de zone franche",
        "type": "suspensif"
    },
    {
        "code": "D3",
        "libelle": "Mise à la consommation (Import TTC)",
        "type": "definitif"
    },
    {
        "code": "D18",
        "libelle": "Entrepôt de stockage / Admission Temporaire",
        "type": "suspensif"
    },
    {
        "code": "D56",
        "libelle": "Admission temporaire / Matériel pro",
        "type": "suspensif"
    },
    {
        "code": "S106",
        "libelle": "Exportation temporaire",
        "type": "suspensif"
    }
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
