const mongoose = require('mongoose');

/**
 * Génère un identifiant basé sur un libellé dans une collection MongoDB.
 *
 * @param {object} condition - Les conditions pour la requête (par exemple, `{ key: 'value' }`).
 * @param {string} valeur - Le champ dont on souhaite récupérer la valeur.
 * @param {string} collectionName - Le nom de la collection à interroger.
 * @returns {Promise<string>} - La valeur récupérée ou une erreur si non trouvée.
 * @throws {Error} - Si un paramètre est invalide ou une erreur survient.
 */
async function fetchOneValue(condition, valeur, collectionName) {
    // Valider les paramètres
    if (!condition || typeof condition !== 'object' || Array.isArray(condition)) {
        throw new Error("Le paramètre 'condition' doit être un objet valide.");
    }

    if (!valeur || typeof valeur !== 'string') {
        throw new Error("Le paramètre 'valeur' doit être une chaîne de caractères.");
    }

    if (!collectionName || typeof collectionName !== 'string') {
        throw new Error("Le paramètre 'collectionName' doit être une chaîne de caractères.");
    }

    try {
        // Obtenir la collection MongoDB
        const Collection = mongoose.connection.collection(collectionName);

        // Rechercher un document avec la condition spécifiée
        const document = await Collection.findOne(condition, { projection: { [valeur]: 1 } });

        // Retourner la valeur du champ spécifié
        return document[valeur];
    } catch (error) {
        throw new Error(`Erreur lors de l'exécution de fetchOneValue : ${error.message}`);
    }
}


/**
 * Génère un identifiant basé sur un libellé dans une collection MongoDB.
 *
 * @param {object} condition - Les conditions pour la requête (par exemple, `{ key: 'value' }`).
 * @param {string} collectionName - Le nom de la collection à interroger.
 * @returns {Promise<string>} - La valeur récupérée ou une erreur si non trouvée.
 * @throws {Error} - Si un paramètre est invalide ou une erreur survient.
 */
async function fetchOneWhere(condition, collectionName) {
    // Valider les paramètres
    if (!condition || typeof condition !== 'object' || Array.isArray(condition)) {
        throw new Error("Le paramètre 'condition' doit être un objet valide.");
    }

    if (!collectionName || typeof collectionName !== 'string') {
        throw new Error("Le paramètre 'collectionName' doit être une chaîne de caractères.");
    }

    try {
        // Obtenir la collection MongoDB
        const Collection = mongoose.connection.collection(collectionName);

        // Rechercher un document avec la condition spécifiée
        const document = await Collection.findOne(condition);

        // Vérifier si le document a été trouvé
        // if (!document) {
        //     throw new Error("Aucune correspondance trouvée avec les conditions fournies.");
        // }

        // Retourner la valeur du champ spécifié
        return document;
    } catch (error) {
        throw new Error(`Erreur lors de l'exécution de fetchOneWhere : ${error.message}`);
    }
}

/**
 * Récupère TOUS les documents d'une collection.
 * @param {string} collectionName - Le nom de la collection à interroger.
 */
async function fetchAll(collectionName) {
    if (!collectionName || typeof collectionName !== 'string') {
        throw new Error("Le paramètre 'collectionName' doit être une chaîne de caractères.");
    }

    try {
        const Collection = mongoose.connection.collection(collectionName);
        // .toArray() est nécessaire car find({}) renvoie un curseur
        const documents = await Collection.find({}).toArray();
        return documents;
    } catch (error) {
        throw new Error(`Erreur lors de l'exécution de fetchAll : ${error.message}`);
    }
}

// Exports
module.exports = {
    fetchOneValue,
    fetchOneWhere,
    fetchAll
};