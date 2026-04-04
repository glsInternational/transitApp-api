const { TarifDouanier } = require('../../dossier/models/tarif.model');

/**
 * Service pour la gestion des nomenclatures et tarifs douaniers
 */
class NomenclatureService {
    
    /**
     * Récupère un tarif par son code SH complet (exact)
     * Gère la recherche dans le code actuel (2022) et l'historique (2017)
     * @param {string} code - Le code SH à rechercher (10 chiffres)
     */
    async getTarifByCode(code) {
        // 1. Recherche par code SH actuel (2022)
        let tarif = await TarifDouanier.findOne({ code_sh: code, status: '1' });
        
        if (tarif) return tarif;

        // 2. Recherche par code SH historique (2017)
        tarif = await TarifDouanier.findOne({ 
            "historical_mappings.code_sh_2017": code,
            status: '1' 
        });

        return tarif;
    }

    /**
     * Recherche des nomenclatures par mot-clé (auto-complétion)
     * @param {string} query - Le texte ou fragment de code à rechercher
     * @param {number} limit - Limite de résultats (par défaut 20)
     */
    async searchNomenclature(query, limit = 20) {
        if (!query || query.length < 2) return [];

        const searchCriteria = {
            status: '1',
            $or: [
                { code_sh: { $regex: query, $options: 'i' } },
                { libelle: { $regex: query, $options: 'i' } },
                { "historical_mappings.code_sh_2017": { $regex: query, $options: 'i' } }
            ]
        };

        return await TarifDouanier.find(searchCriteria)
            .limit(limit)
            .sort({ code_sh: 1 });
    }

    /**
     * Extrait les détails d'un tarif pour calcul fiscal
     * @param {string} code 
     */
    async getTaxDetails(code) {
        const tarif = await this.getTarifByCode(code);
        if (!tarif) return null;

        return {
            code_sh: tarif.code_sh,
            libelle: tarif.libelle,
            taxes: {
                dd: tarif.dd,
                tva: tarif.tva,
                pcc: tarif.pcc,
                pcs: tarif.pcs,
                pua: tarif.pua,
                rst: tarif.rst
            },
            is_historical: tarif.code_sh !== code
        };
    }
}

module.exports = new NomenclatureService();
