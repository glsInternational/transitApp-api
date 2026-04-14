const fs = require('fs');

const filePath = 'c:\\Users\\Donald\\Projects\\node\\transit_api\\docs\\liste_des_regimes_douaniers_a_la_date_du_29-07-2021.txt';
const seederPath = 'c:\\Users\\Donald\\Projects\\node\\transit_api\\src\\seeders\\seedRegimes.js';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split(/\r?\n/);
const newRegimes = [];

lines.forEach(line => {
    const trimmed = line.trim();
    const match = trimmed.match(/^(\d{4})\s+(.+)$/);
    if (match) {
        const code = match[1];
        const libelle = match[2].trim();
        let type = "suspensif";
        if (code.startsWith('1') || code.startsWith('4')) {
            type = "definitif";
        }
        newRegimes.push({ code, libelle, type });
    }
});

// Specific codes to preserve as they are used in app logic
const preserveCodes = [
    { code: "D3", libelle: "Mise à la consommation (Import TTC)", type: "definitif" },
    { code: "D18", libelle: "Entrepôt de stockage / Admission Temporaire", type: "suspensif" },
    { code: "D56", libelle: "Admission temporaire / Matériel pro", type: "suspensif" },
    { code: "S106", libelle: "Exportation temporaire", type: "suspensif" }
];

// Merge (only add preserveCodes if not already in newRegimes)
const finalRegimes = [...newRegimes];
preserveCodes.forEach(p => {
    if (!finalRegimes.find(r => r.code === p.code)) {
        finalRegimes.push(p);
    }
});

const seederContent = `const mongoose = require('mongoose');
const { RegimeDouanier } = require('../dossier/models/regime.model');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../config/connection');

const regimes = ${JSON.stringify(finalRegimes, null, 4)};

async function seedRegimes() {
    try {
        let dbUrl;
        if (DB_MONGO_USER && DB_MONGO_PASSWORD) {
            dbUrl = \`mongodb://\${DB_MONGO_USER}:\${DB_MONGO_PASSWORD}@\${DB_MONGO_HOST}:\${DB_MONGO_PORT}/\${MONGO_DATABASE}?authSource=admin\`;
        } else {
            dbUrl = \`mongodb://\${DB_MONGO_HOST}:\${DB_MONGO_PORT}/\${MONGO_DATABASE}\`;
        }

        console.log(\`Connexion à MongoDB (\${MONGO_DATABASE})...\`);
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
            console.log(\`Régime \${r.code} synchronisé.\`);
        }

        console.log("Seeding des régimes douaniers terminé avec succès !");
        process.exit(0);
    } catch (error) {
        console.error("Erreur seeding:", error);
        process.exit(1);
    }
}

seedRegimes();
`;

fs.writeFileSync(seederPath, seederContent);
console.log("seedRegimes.js updated successfully.");
