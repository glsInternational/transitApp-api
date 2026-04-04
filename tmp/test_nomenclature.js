const mongoose = require('mongoose');
const nomenclatureService = require('../src/nomenclature/services/nomenclature.service');
const { DB_MONGO_HOST, MONGO_DATABASE, DB_MONGO_PORT, DB_MONGO_USER, DB_MONGO_PASSWORD } = require('../src/config/connection');

async function testService() {
    try {
        let dbUrl;
        if (DB_MONGO_USER && DB_MONGO_PASSWORD) {
            dbUrl = `mongodb://${DB_MONGO_USER}:${DB_MONGO_PASSWORD}@${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}?authSource=admin`;
        } else {
            dbUrl = `mongodb://${DB_MONGO_HOST}:${DB_MONGO_PORT}/${MONGO_DATABASE}`;
        }
        await mongoose.connect(dbUrl);
        
        console.log("--- Test Recherche Code 2022 (Bovins) ---");
        const b02 = await nomenclatureService.getTaxDetails("0202300000");
        console.log(JSON.stringify(b02, null, 2));

        console.log("\n--- Test Recherche par Libellé (Mots-clés) ---");
        const search = await nomenclatureService.searchNomenclature("Ciment", 3);
        console.log(`Trouvé ${search.length} résultats pour 'Ciment'`);
        search.forEach(s => console.log(` - ${s.code_sh} : ${s.libelle}`));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testService();
