const auditService = require('../services/audit.service');

/**
 * Audit un dossier via son code_dossier
 */
exports.auditDossier = async (req, res) => {
    try {
        const { codeDossier } = req.params;
        const report = await auditService.auditDossier(codeDossier);

        res.status(200).json({
            status: true,
            message: report.summary.is_compliant ? "Dossier Conforme" : "Écarts de taxation détectés",
            data: report
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

/**
 * Commande d'auto-correction (Optionnel - Pourrait être implémenté ici ou dans DossierController)
 */
exports.autoCorrectDossier = async (req, res) => {
    // Logique pour mettre à jour les taux du dossier avec ceux du TEC en un clic
    // À implémenter si besoin
};
