const { Dossier } = require('../../dossier/models/dossier.model');
const { TarifDouanier } = require('../../dossier/models/tarif.model');

/**
 * Audit un dossier complet en comparant ses taux avec la base officielle
 */
exports.auditDossier = async (codeDossier) => {
    const dossier = await Dossier.findOne({ code_dossier: codeDossier });
    if (!dossier) throw new Error("Dossier non trouvé");

    const auditResults = [];
    let errorCount = 0;

    for (let i = 0; i < dossier.articles.length; i++) {
        const art = dossier.articles[i];
        if (!art.nomenclature) {
            auditResults.push({ index: i, status: 'warning', message: "Nomenclature manquante" });
            continue;
        }

        const official = await TarifDouanier.findOne({ code_sh: art.nomenclature });
        
        if (!official) {
            auditResults.push({ 
                index: i, 
                status: 'error', 
                nomenclature: art.nomenclature,
                message: "Code SH non trouvé dans le référentiel TEC" 
            });
            errorCount++;
            continue;
        }

        const discrepancies = [];
        const check = (label, current, target) => {
            if (Number(current) !== Number(target)) {
                discrepancies.push({ label, current, target });
            }
        };

        check("DD", art.rate_dd, official.dd);
        check("TVA", art.rate_tva, official.tva);
        check("PCS", art.rate_pcs, official.pcs);
        check("PCC", art.rate_pcc, official.pcc);
        check("RSTA", art.rate_rsta, official.rst);

        if (discrepancies.length > 0) {
            auditResults.push({
                index: i,
                status: 'error',
                nomenclature: art.nomenclature,
                libelle: official.libelle,
                discrepancies
            });
            errorCount++;
        } else {
            auditResults.push({
                index: i,
                status: 'success',
                nomenclature: art.nomenclature,
                message: "Conforme"
            });
        }
    }

    return {
        code_dossier: codeDossier,
        audit_date: new Date(),
        summary: {
            total_articles: dossier.articles.length,
            errors: errorCount,
            is_compliant: errorCount === 0
        },
        results: auditResults
    };
};
