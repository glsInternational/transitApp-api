const { TypeDepense } = require('../models/type_depense.model');

exports.createTypeDepense = async (req, res) => {
    try {
        const { libelle } = req.body;
        if (!libelle) return res.status(400).json({ status: false, message: "Le libellé est requis" });
        
        const newType = new TypeDepense({ libelle });
        await newType.save();
        res.status(201).json({ status: true, message: "Type de dépense ajouté avec succès", data: newType });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.getTypeDepenses = async (req, res) => {
    try {
        const types = await TypeDepense.find({ status: '1' }).sort({ createdAt: -1 });
        res.status(200).json({ status: true, data: types });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.updateTypeDepense = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await TypeDepense.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ status: true, message: "Mise à jour réussie", data: updated });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.deleteTypeDepense = async (req, res) => {
    try {
        const { id } = req.params;
        await TypeDepense.findByIdAndUpdate(id, { status: '0' });
        res.status(200).json({ status: true, message: "Suppression réussie" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};
