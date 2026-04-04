const jwt = require('jsonwebtoken');

/**
 * Middleware pour valider le Jetons Web JSON (JWT).
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const verifyJWT = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: false,
                message: "Accès refusé : Token JWT manquant."
            });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'votre_cle_secrete_ultra_securisee_2026';

        // Vérification du token
        const decoded = jwt.verify(token, secret);

        // On injecte les informations de l'utilisateur dans l'objet de requête
        // Ce qui permettra de savoir qui effectue l'action (audit)
        req.user = decoded;

        next();
    } catch (error) {
        let message = "Accès refusé : Token invalide.";
        if (error.name === 'TokenExpiredError') {
            message = "Accès refusé : Session expirée. Veuillez vous reconnecter.";
        }

        return res.status(403).json({
            status: false,
            message: message
        });
    }
};

module.exports = { verifyJWT };
