const mongoose = require('mongoose');
const { RegimeDouanier } = require('../src/dossier/models/regime.model');

console.log("Model name:", RegimeDouanier.modelName);
console.log("Collection name:", RegimeDouanier.collection.name);
process.exit(0);
