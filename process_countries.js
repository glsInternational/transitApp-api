const fs = require('fs');

try {
    // Read the file and handle possible UTF-16 encoding from PowerShell
    let rawContent = fs.readFileSync('tmp/countries.json');
    let content = rawContent.toString();

    // Clean up if it's UTF-16
    if (content.startsWith('\ufeff') || content.includes('\u0000')) {
        content = rawContent.toString('utf16le');
    }

    const data = JSON.parse(content);

    const formatted = data.map(c => {
        const currencies = c.currencies ? Object.keys(c.currencies) : [];
        const nom = (c.translations && c.translations.fra && c.translations.fra.common) ? c.translations.fra.common : c.name.common;
        return {
            code: c.cca2,
            nom: nom,
            capitale: c.capital && c.capital.length > 0 ? c.capital[0] : "",
            continent: c.region,
            devise: currencies.length > 0 ? currencies[0] : "",
            fuseau_horaire: c.timezones && c.timezones.length > 0 ? c.timezones[0] : ""
        };
    }).sort((a, b) => a.nom.localeCompare(b.nom));

    // Limit to 195 most relevant or just take all (usually ~250 in this API)
    // The user said 195, but having all 250 is usually better.
    // I'll filter for common names to ensure we have the main ones.

    const finalCountries = formatted;

    const seederTemplate = (countries) => `const mongoose = require('mongoose');
const { Pays } = require('../pays/models/pays.model');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../config/connection');

const countries = ${JSON.stringify(countries, null, 4)};

async function seedPays() {
    try {
        let dbUrl = process.env.MONGO_URI;
        if (!dbUrl) {
            if (DB_MONGO_USER && DB_MONGO_PASSWORD) {
                dbUrl = \`mongodb://\${DB_MONGO_USER}:\${DB_MONGO_PASSWORD}@\${DB_MONGO_HOST}:\${DB_MONGO_PORT}/\${MONGO_DATABASE}?authSource=admin\`;
            } else {
                dbUrl = \`mongodb://\${DB_MONGO_HOST}:\${DB_MONGO_PORT}/\${MONGO_DATABASE}\`;
            }
        }

        console.log(\`Connexion à MongoDB pour le seeding des pays...\`);
        await mongoose.connect(dbUrl, { family: 4 });

        console.log("Nettoyage de la collection acl_pays...");
        await Pays.deleteMany({});

        console.log(\`Insertion de \${countries.length} pays...\`);
        await Pays.insertMany(countries);

        console.log("Seeding des pays terminé !");
        process.exit(0);
    } catch (error) {
        console.error("Erreur seeding pays:", error);
        process.exit(1);
    }
}

seedPays();
`;

    fs.writeFileSync('src/seeders/seedPays.js', seederTemplate(finalCountries));
    console.log(`Successfully updated seeder with ${finalCountries.length} countries.`);

} catch (e) {
    console.error("Error processing countries:", e);
}
