const { Champ } = require("../models/input.model");
const { generateIdentifiant } = require("../../../utils/utils");

// ADD Champ
exports.registerChamp = async (req, res) => {
  try {
    const {
      menu,
      visible_par,
      libelle,
      id_champ,
      type_champ,
      ordre,
      commentaire,
      obligatoire,
    } = req.body;

    // Vérifier si un élément avec cet id_champ et ce menu existe déjà
    const existeId_champ = await Champ.findOne({
      id_champ: id_champ,
      menu: menu,
    });

    if (existeId_champ) {
      return res.status(409).json({
        // Code 409 : Conflict
        status: false,
        message: "Cet identifiant existe déjà pour ce menu.",
        data: {},
      });
    }

    // Vérifier si un élément avec cet ordre et ce menu existe déjà
    const existeOrdre = await Champ.findOne({ ordre: ordre, menu: menu });

    if (existeOrdre) {
      return res.status(409).json({
        // Code 409 : Conflict
        status: false,
        message: "Cet ordre existe déjà pour ce menu.",
        data: {},
      });
    }

    const champ = new Champ({
      menu,
      visible_par,
      libelle,
      id_champ,
      type_champ,
      ordre,
      commentaire,
      obligatoire,
    });

    await champ.save();

    // Conversion de l'utilisateur en objet
    const champReponse = champ.formatResponse(champ);

    res.status(201).json({
      status: true,
      message: "Champ enregistré avec succès.",
      data: champReponse,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: {},
    });
  }
};

//GET ID CHAMP / LIBELLE
exports.generationId = async (req, res) => {
  try {
    const { libelle } = req.body;

    // Validation de l'entrée
    if (
      !libelle ||
      typeof libelle !== "string" ||
      libelle.trim().length === 0
    ) {
      return res.status(400).json({
        status: false,
        message:
          "Le champ 'libelle' est requis et doit être une chaîne non vide.",
        data: {},
      });
    }

    // Génération de l'identifiant
    const identifiant = generateIdentifiant(libelle);

    // Réponse réussie
    return res.status(201).json({
      status: true,
      message: "Identifiant généré avec succès.",
      data: { identifiant: identifiant },
    });
  } catch (error) {
    // Log de l'erreur (facultatif)
    console.error("Erreur lors de la génération de l’identifiant :", error);

    // Réponse en cas d'erreur
    return res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: {},
    });
  }
};

//GET DETAILS CHAMP / CODE_CHAMP
exports.getChampInfo = async (req, res) => {
  try {
    const code_champ = req.params.code_champ;

    const champ = await Champ.findOne({ code_champ: code_champ });
    if (!champ) {
      return res.status(404).json({
        status: false,
        message: "Champ non trouvée.",
        data: {},
      });
    }

    // Supprimer les informations sensibles
    const champReponse = await champ.formatResponse(champ);

    res.status(200).json({
      status: true,
      message: "Succès.",
      data: champReponse,
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
exports.getChampInfoByMenu = async (req, res) => {
  try {
    const { menu } = req.params;

    const champs = await Champ.find({ menu: menu });

    if (!champs || champs.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Aucun champ trouvé pour ce menu.",
        data: [],
      });
    }

    const champsReponse = await Promise.all(
      champs.map(async (champ) => await champ.formatResponse())
    );

    return res.status(200).json({
      status: true,
      message: "Succès.",
      data: champsReponse,
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
exports.getChampListe = async (req, res) => {
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

// Mise A JOUR DU NOTE
exports.updateChamp = async (req, res) => {
  try {
    const {
      menu,
      visible_par,
      libelle,
      id_champ,
      type_champ,
      ordre,
      commentaire,
      obligatoire,
      code_champ,
    } = req.body;

    // Vérifier si l'utilisateur existe
    const champ = await Champ.findOne({ code_champ: code_champ });
    if (!champ) {
      return res.status(404).json({
        status: false,
        message: "Champ non trouvée.",
        data: {},
      });
    }

    // Mettre à jour les champs modifiables
    if (menu) champ.menu = menu;
    if (visible_par) champ.visible_par = visible_par;
    if (libelle) champ.libelle = libelle;
    if (id_champ) champ.id_champ = id_champ;
    if (type_champ) champ.type_champ = type_champ;
    if (ordre) champ.ordre = ordre;
    if (commentaire) champ.commentaire = commentaire;
    if (obligatoire) champ.obligatoire = obligatoire;

    // Enregistrer les modifications
    await champ.save();

    // Supprimer le mot de passe des données de la réponse
    const champReponse = champ.formatResponse(champ);

    res.status(200).json({
      status: true,
      message: "Champ mise à jour avec succès.",
      data: champReponse,
    });
  } catch (error) {
    res.status(400).json({
      status: true,
      message: error.message || "Une erreur interne est survenue.",
      data: {},
    });
  }
};

exports.deleteChamp = async (req, res) => {
  try {
    const code_champ = req.params.code_champ;

    // Vérifier si le champ existe
    const champ = await Champ.findOne({ code_champ: code_champ });
    if (!champ) {
      return res.status(404).json({
        status: false,
        message: "Champ non trouvé.",
        data: {},
      });
    }

    // Supprimer le champ
    await champ.deleteOne({ code_champ: code_champ });

    res.status(200).json({
      status: true,
      message: "Champ supprimé avec succès.",
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
