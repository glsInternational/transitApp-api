const { Audit } = require('../models/audit.model');

/**
 * Enregistre une action administrative dans le journal d'audit.
 * 
 * @param {Object} req - L'objet de requête Express (pour l'IP et l'utilisateur).
 * @param {string} action - L'action effectuée (CREATE, UPDATE, DELETE, etc.).
 * @param {string} module - Le module concerné (DOSSIER, MENU, ADMIN...).
 * @param {Object} details - Les détails de l'action effectués (ex: nouveaux champs).
 */
const logAction = async (req, action, module, details = {}) => {
    try {
        // req.user est injecté par le middleware JWT (que nous allons créer)
        const user = req.user || { nom: 'Système', email: 'system@transit.ci' };

        const auditEntry = new Audit({
            administrateur: user.nom,
            email: user.email,
            action: action,
            module: module,
            details: details,
            ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown'
        });

        await auditEntry.save();
        console.log(`[AUDIT] Action ${action} par ${user.nom} sur le module ${module}`);
    } catch (error) {
        console.error('[AUDIT] Erreur lors de l\'enregistrement de l\'audit:', error);
    }
};

module.exports = { logAction };
