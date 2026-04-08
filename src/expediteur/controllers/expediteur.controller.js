const { Expediteur } = require('../models/expediteur.model');

// ADD EXPEDITEUR
exports.registerExpediteur = async (req, res) => {
    try {
        const expediteur = new Expediteur(req.body);
        await expediteur.save();
        res.status(201).json({ status: true, message: 'Expéditeur créé avec succès.', data: expediteur });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// GET ALL EXPEDITEURS
exports.getExpediteurListe = async (req, res) => {
    try {
        const expediteurs = await Expediteur.find().populate({ path: 'pays', model: 'acl_pays' }).sort({ nom: 1 });
        res.status(200).json({ status: true, message: 'Succès.', data: expediteurs });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

// UPDATE EXPEDITEUR
exports.updateExpediteur = async (req, res) => {
    try {
        const { id, ...updates } = req.body;
        const expediteur = await Expediteur.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json({ status: true, message: 'Expéditeur mis à jour.', data: expediteur });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
};

// DELETE EXPEDITEUR
exports.deleteExpediteur = async (req, res) => {
    try {
        await Expediteur.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: true, message: 'Expéditeur supprimé.' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};
