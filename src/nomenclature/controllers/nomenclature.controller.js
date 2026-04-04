const nomenclatureService = require('../services/nomenclature.service');

/**
 * Contrôleur pour la gestion de la nomenclature douanière
 */
class NomenclatureController {
    
    /**
     * Recherche par code SH (exact) ou par historique
     * GET /api/nomenclature/v1/byCode/:code
     */
    async getByCode(req, res) {
        try {
            const { code } = req.params;
            if (!code) {
                return res.status(400).json({ message: "Le code est obligatoire." });
            }

            const result = await nomenclatureService.getTaxDetails(code);
            if (!result) {
                return res.status(404).json({ message: `Nomenclature '${code}' non trouvée.` });
            }

            res.status(200).json(result);
        } catch (error) {
            console.error("Erreur getByCode:", error);
            res.status(500).json({ message: "Une erreur est survenue lors de la récupération du tarif." });
        }
    }

    /**
     * Recherche multi-critères (recherche de texte ou de code partiel)
     * GET /api/nomenclature/v1/search?q=...
     */
    async search(req, res) {
        try {
            const { q, limit } = req.query;
            if (!q) {
                return res.status(400).json({ message: "La requête de recherche 'q' est obligatoire." });
            }

            const results = await nomenclatureService.searchNomenclature(q, parseInt(limit) || 20);
            
            res.status(200).json({
                count: results.length,
                results: results.map(r => ({
                    code_sh: r.code_sh,
                    libelle: r.libelle,
                    taxes: {
                        dd: r.dd,
                        tva: r.tva,
                        pcc: r.pcc,
                        pcs: r.pcs,
                        pua: r.pua,
                        rst: r.rst
                    }
                }))
            });
        } catch (error) {
            console.error("Erreur search:", error);
            res.status(500).json({ message: "Une erreur est survenue lors de la recherche." });
        }
    }
}

module.exports = new NomenclatureController();
