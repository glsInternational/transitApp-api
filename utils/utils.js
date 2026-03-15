/**
 * Génère un token aléatoire basé sur une chaîne de caractères donnée.
 *
 * @param {number} length - La longueur souhaitée du token.
 * @param {string} baseString - La chaîne de caractères à utiliser pour générer le token.
 * @returns {string} - Le token généré.
 * @throws {Error} - Si les paramètres sont invalides.
 */


function generateToken(length, baseString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error("La longueur doit être un nombre entier positif.");
    }

    if (!baseString || typeof baseString !== 'string' || baseString.length === 0) {
        throw new Error("La chaîne de base doit être une chaîne non vide.");
    }

    let token = '';
    const baseLength = baseString.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * baseLength);
        token += baseString[randomIndex];
    }

    return token;
}

module.exports.generateToken = generateToken;


/**
 * Génère un identifiant basé sur un libellé.
 *
 * @param {string} libelle - Le libellé à utiliser pour générer l'identifiant.
 * @returns {string} - L'identifiant généré.
 * @throws {Error} - Si le paramètre est invalide.
 */
function generateIdentifiant(libelle) {
    // Si vide ou pas string, on renvoie une chaîne vide au lieu de crash
    if (!libelle || typeof libelle !== 'string' || libelle.trim().length === 0) {
        return "";
    }

    let identifiant = libelle.trim().toLowerCase();

    // Supprimer les caractères spéciaux
    identifiant = identifiant.replace(/[\(\)\{\}\[\]]/g, '');

    // Supprimer les accents
    identifiant = identifiant.normalize("NFD").replace(/[\u0300-\u036f]/g, '');

    // Remplacer les séparateurs par des underscores
    // Note : On peut utiliser une Regex pour aller plus vite
    const regex = /[ \/\-\'\.\°]/g;
    identifiant = identifiant.replace(regex, '_');

    // Optionnel : éviter les doubles underscores (ex: "prix  ht" -> "prix__ht" -> "prix_ht")
    identifiant = identifiant.replace(/_+/g, '_');

    return identifiant;
}

module.exports.generateIdentifiant = generateIdentifiant;



