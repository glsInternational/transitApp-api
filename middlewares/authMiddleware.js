const verifyApiKey = (req, res, next) => {
    const apiKey = req.header('X-Api-Key');
    const validApiKey = process.env.API_KEY || '7db5d78b-cef3-4e2d-ac6d-2be2fe3cf494';

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            status: false,
            message: "Accès refusé : Clé API invalide ou manquante."
        });
    }

    // Si tout est ok, on passe à la suite (le contrôleur)
    next();
};

module.exports.verifyApiKey = verifyApiKey;