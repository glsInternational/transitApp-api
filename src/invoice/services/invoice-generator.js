const { airInvoiceTemplate } = require('../templates/air-invoice');
const { maritimeInvoiceTemplate } = require('../templates/maritime-invoice');

/**
 * Service pour la génération des factures (HTML)
 */
class InvoiceGenerator {
    /**
     * Génère le HTML d'une facture en fonction de son type et du mode de transport
     * @param {Object} invoice - L'objet facture (DB)
     * @returns {string} - Le HTML généré
     */
    static generateHTML(invoice) {
        if (!invoice) throw new Error("Facture non fournie");

        const typeVoie = invoice.dossierInfo?.type_voie?.toLowerCase();
        
        // La distinction Proforma / Définitive est gérée à l'intérieur des templates
        // via le champ invoice.type ('proforma' ou 'final')
        
        if (typeVoie === 'aerienne' || typeVoie === 'air') {
            return airInvoiceTemplate(invoice);
        } else if (typeVoie === 'maritime' || typeVoie === 'mer') {
            return maritimeInvoiceTemplate(invoice);
        } else {
            // Par défaut on utilise le template Air (le plus complet)
            return airInvoiceTemplate(invoice);
        }
    }

    /**
     * Détermine si une facture est proforma
     * @param {Object} invoice 
     * @returns {boolean}
     */
    static isProforma(invoice) {
        return invoice.type === 'proforma';
    }

    /**
     * Retourne le libellé du type de facture
     * @param {Object} invoice 
     * @returns {string}
     */
    static getInvoiceLabel(invoice) {
        return this.isProforma(invoice) ? 'FACTURATION PROFORMA' : 'FACTURATION DÉFINITIVE';
    }
}

module.exports = InvoiceGenerator;
