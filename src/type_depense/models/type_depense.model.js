const mongoose = require('mongoose');

const typeDepenseSchema = new mongoose.Schema({
    libelle: { type: String, required: true },
    status: { type: String, enum: ['0', '1'], default: '1' },
    createdAt: { type: Date, default: Date.now },
});

const TypeDepense = mongoose.model('TypeDepense', typeDepenseSchema);

module.exports = { TypeDepense };
