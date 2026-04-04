const { InvoiceConfig } = require('../models/invoiceConfig.model');

// GET INVOICE CONFIG (Only one)
exports.getInvoiceConfig = async (req, res) => {
    try {
        let config = await InvoiceConfig.findOne({ status: '1' });
        if (!config) {
            // Create a default if it doesn't exist
            config = await InvoiceConfig.create({ footer: "", status: '1' });
        }
        res.status(200).json({
            status: true,
            data: config,
            message: "Configuration récupérée avec succès"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Une erreur est survenue lors de la récupération de la configuration",
            error: error.message
        });
    }
};

// SAVE INVOICE CONFIG (Update or Create)
exports.saveInvoiceConfig = async (req, res) => {
    try {
        const { footer } = req.body;
        
        const config = await InvoiceConfig.findOneAndUpdate(
            { status: '1' },
            { footer: footer },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            status: true,
            data: config,
            message: "Configuration enregistrée avec succès"
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Une erreur est survenue lors de l'enregistrement de la configuration",
            error: error.message
        });
    }
};
