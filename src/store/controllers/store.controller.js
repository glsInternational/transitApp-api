const { fetchOneValue, fetchAll, fetchOneWhere } = require("../../../services/requetes");
const { generateToken } = require("../../../utils/utils");
const { Champ } = require("../../inputs/models/input.model");
const mongoose = require("mongoose");

// ADD Champ
exports.registerDynamique = async (req, res) => {
  try {
    const { menu, ...formData } = req.body;
    const tableName = await fetchOneValue({ code_menu: menu }, "tbl_name", "acl_menus");

    if (!tableName || typeof tableName !== "string" || !menu) {
      return res.status(400).json({
        status: false,
        message: "Les champs 'tableName' et 'menu' sont requis.",
        data: {},
      });
    }

    // Récupération des champs autorisés depuis acl_champs
    const champs = await Champ.find({ menu });

    if (!champs.length) {
      return res.status(404).json({
        status: false,
        message: `Aucun champ trouvé pour le menu '${menu}'`,
        data: {},
      });
    }

    // Construction de l'objet à insérer uniquement avec les champs autorisés
    const dataToSave = { menu };
    for (let champ of champs) {
      const key = champ.id_champ;
      if (formData.hasOwnProperty(key)) {
        dataToSave[key] = formData[key];
      }
    }

    // Génère un code_dynamique si non fourni
    if (!formData.code_dynamique) {
      dataToSave.code_dynamique = generateToken(16);
    }

    // Création dynamique du modèle
    const Model =
      mongoose.models[tableName] ||
      mongoose.model(tableName, new mongoose.Schema({}, { strict: false }));

    const doc = new Model(dataToSave);
    await doc.save();

    const response = doc.toObject();
    delete response._id;
    delete response.__v;

    res.status(201).json({
      status: true,
      message: "Enregistrement effectué avec succès.",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Erreur serveur.",
      data: {},
    });
  }
};

// Mise A JOUR DU NOTE
exports.updateDynamqique = async (req, res) => {
  try {
    const { code_dynamique } = req.params; // On s'attend à ce que le code soit dans l'URL
    const { menu, ...formData } = req.body;

    if (!menu || !code_dynamique) {
      return res.status(400).json({
        status: false,
        message: "Le 'menu' dans le body et le 'code_dynamique' dans l'URL sont requis.",
        data: {},
      });
    }

    const tableName = await fetchOneValue({ code_menu: menu }, "tbl_name", "acl_menus");

    if (!tableName) {
      return res.status(400).json({
        status: false,
        message: "Table de destination introuvable pour ce menu.",
        data: {},
      });
    }

    // Récupération des champs autorisés depuis acl_champs
    const champs = await Champ.find({ menu });

    if (!champs.length) {
      return res.status(404).json({
        status: false,
        message: `Aucun champ trouvé pour le menu '${menu}'`,
        data: {},
      });
    }

    // Construction de l'objet de mise à jour uniquement avec les champs autorisés
    const dataToUpdate = {};
    for (let champ of champs) {
      const key = champ.id_champ;
      if (formData.hasOwnProperty(key)) {
        dataToUpdate[key] = formData[key];
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Aucune donnée valide fournie pour la mise à jour.",
        data: {},
      });
    }

    // Accéder directement à la collection MongoDB (comme tu l'as fait pour delete)
    const Collection = mongoose.connection.collection(tableName);

    // Vérifier si l'enregistrement dynamique existe
    const existingDoc = await Collection.findOne({ code_dynamique: code_dynamique });
    if (!existingDoc) {
      return res.status(404).json({
        status: false,
        message: "Enregistrement non trouvé.",
        data: {},
      });
    }

    // Mettre à jour l'enregistrement
    await Collection.updateOne(
      { code_dynamique: code_dynamique },
      { $set: dataToUpdate }
    );

    // Récupérer le document mis à jour pour le renvoyer proprement
    const updatedDoc = await Collection.findOne({ code_dynamique: code_dynamique });
    if (updatedDoc) {
      delete updatedDoc._id; // On retire l'ObjectId natif de Mongo pour la réponse
    }

    res.status(200).json({
      status: true,
      message: "Enregistrement mis à jour avec succès.",
      data: updatedDoc,
    });
  } catch (error) {
    res.status(500).json({ // Correction: 500 et status false
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: {},
    });
  }
};

//GET DETAILS CHAMP / CODE_CHAMP
exports.getOneDynamique = async (req, res) => {
  try {
    const { code_dynamique, menu } = req.params;
    const tableName = await fetchOneValue({ code_menu: menu }, 'tbl_name', "acl_menus");
    const champ = await fetchOneWhere({ code_dynamique: code_dynamique }, tableName);

    if (!champ) {
      return res.status(404).json({
        status: false,
        message: "Champ non trouvée.",
        data: {},
      });
    }

    // Supprimer les informations sensibles
    // const champReponse = await champ.formatResponse(champ);

    res.status(200).json({
      status: true,
      message: "Succès.",
      data: champ,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: {},
    });
  }
};

//GET DETAILS CHAMP / menu
exports.getDynamiqueInfoByMenu = async (req, res) => {
  try {
    const { menu } = req.params;
    const tableName = await fetchOneValue({ code_menu: menu }, "tbl_name", "acl_menus");

    const champs = await fetchAll(tableName)

    if (!champs || champs.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Aucune donnée trouvée pour ce menu.",
        data: [],
      });
    }

    // const champsReponse = await Promise.all(
    //   champs.map(async (champ) => await champ.formatResponse())
    // );

    return res.status(200).json({
      status: true,
      message: "Succès.",
      data: champs,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: [],
    });
  }
};

//GET ALL NOTES
exports.getDynamiqueListe = async (req, res) => {
  try {
    // Récupérer tous les profils
    const champs = await Champ.find();

    // Supprimer les informations sensibles pour chaque profil
    const champReponse = await Promise.all(
      champs.map(async (champ, index) => {
        const formattedResponse = await champ.formatResponse();
        return {
          ...formattedResponse,
          position: index + 1, // Ajoute la position en commençant par 1
        };
      })
    );

    res.status(200).json({
      status: true,
      message: "Succès.",
      data: champReponse,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: [],
    });
  }
};

exports.deleteDynamque = async (req, res) => {
  try {
    const { code_dynamique, menu } = req.params;

    // 1. Récupérer le nom de la table (collection)
    const tableName = await fetchOneValue({ code_menu: menu }, "tbl_name", "acl_menus");

    if (!tableName) {
      return res.status(400).json({ status: false, message: "Table de destination introuvable." });
    }

    // 2. Accéder directement à la collection MongoDB
    const Collection = mongoose.connection.collection(tableName);

    // 3. Vérifier si le document existe
    const champ = await Collection.findOne({ code_dynamique: code_dynamique });

    if (!champ) {
      return res.status(404).json({
        status: false,
        message: "Élément non trouvé.",
        data: {},
      });
    }

    // 4. Supprimer l'élément via la collection (et non via l'objet 'champ')
    await Collection.deleteOne({ code_dynamique: code_dynamique });

    res.status(200).json({
      status: true,
      message: "Élément supprimé avec succès.",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: {},
    });
  }
};
