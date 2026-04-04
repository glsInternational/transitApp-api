const mongoose = require('mongoose');
const { RegimeDouanier } = require('../src/dossier/models/regime.model');

async function check() {
    // Check transit_api
    const url1 = "mongodb://localhost:27017/transit_api";
    await mongoose.connect(url1);
    const count1 = await RegimeDouanier.countDocuments();
    console.log(`Count in transit_api: ${count1}`);
    await mongoose.disconnect();

    // Check transit
    const url2 = "mongodb://localhost:27017/transit";
    await mongoose.connect(url2);
    const count2 = await RegimeDouanier.countDocuments();
    console.log(`Count in transit: ${count2}`);
    await mongoose.disconnect();

    process.exit(0);
}
check();
