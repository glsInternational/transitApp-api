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
/**
 * Convertit un nombre en lettres (Français)
 * Adapté pour les besoins de facturation (XOF)
 */
function numberToFrenchWords(nbr) {
    let unit = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    let tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
    let special = ["onze", "douze", "treize", "quatorze", "quinze", "seize"];

    function convert(n) {
        if (n < 10) return unit[n];
        if (n === 10) return "dix";
        if (n > 10 && n < 17) return special[n - 11];
        if (n < 20) return "dix-" + unit[n - 10];
        if (n < 70) {
            let t = Math.floor(n / 10);
            let u = n % 10;
            if (u === 1 && t < 7) return tens[t] + " et un";
            return tens[t] + (u > 0 ? "-" + unit[u] : "");
        }
        if (n < 80) return "soixante-" + convert(n - 60 === 1 ? 11 : n - 60).replace("dix-un", "onze");
        if (n < 100) {
            let u = n % 10;
            return "quatre-vingt" + (u > 0 ? "-" + unit[u] : (n === 80 ? "s" : ""));
        }
        if (n < 100) {
            return "quatre-vingt-" + convert(n - 80);
        }
        if (n < 1000) {
            let h = Math.floor(n / 100);
            let rest = n % 100;
            if (h === 1) return "cent" + (rest > 0 ? " " + convert(rest) : "");
            return unit[h] + " cent" + (h > 1 && rest === 0 ? "s" : "") + (rest > 0 ? " " + convert(rest) : "");
        }
        if (n < 1000000) {
            let th = Math.floor(n / 1000);
            let rest = n % 1000;
            if (th === 1) return "mille" + (rest > 0 ? " " + convert(rest) : "");
            return convert(th) + " mille" + (rest > 0 ? " " + convert(rest) : "");
        }
        if (n < 1000000000) {
            let m = Math.floor(n / 1000000);
            let rest = n % 1000000;
            return convert(m) + " million" + (m > 1 ? "s" : "") + (rest > 0 ? " " + convert(rest) : "");
        }
        return n.toString();
    }

    if (nbr === 0) return "zéro";
    let words = convert(nbr);
    // Capitalize first letter
    return words.charAt(0).toUpperCase() + words.slice(1);
}

module.exports.numberToFrenchWords = numberToFrenchWords;
