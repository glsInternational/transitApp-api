const { fetchOneValue, fetchAll, fetchOneWhere } = require("../../../services/requetes");
const { generateToken } = require("../../../utils/utils");
const { Champ } = require("../../inputs/models/input.model");
const mongoose = require("mongoose");

// ─── Utilitaire : résoudre code_menu → { menuId, tableName } ─────────────────
const resolveMenu = async (code_menu) => {
  const menu = await mongoose
    .model("acl_menus")
    .findOne({ code_menu, type: "dynamique" }, "_id tbl_name designation code_menu");
  if (!menu) return null;
  return { menuId: menu._id, tableName: menu.tbl_name, designation: menu.designation, code_menu: menu.code_menu };
};

// ─── Utilitaire : valider les données soumises selon les champs du menu ───────
// Retourne { dataToSave, errors } en tenant compte de is_unique dans la collection
const buildAndValidateData = async (champs, formData, tableName, excludeCode = null) => {
  const Collection = mongoose.connection.collection(tableName);
  const dataToSave = {};
  const errors = [];

  for (const champ of champs) {
    const key = champ.id_champ;
    const value = formData[key];

    // Si c'est une mise à jour (excludeCode présent) et que le champ n'est pas envoyé, on l'ignore (mise à jour partielle)
    if (excludeCode && value === undefined) {
      continue;
    }

    // Champ obligatoire manquant
    if (champ.obligatoire === "oui" && (value === undefined || value === null || value === "")) {
      errors.push(`Le champ '${champ.libelle}' (${key}) est obligatoire.`);
      continue;
    }

    if (value !== undefined && value !== null && value !== "") {
      // ─── VALIDATION MÉTIER (Email, Phone, Number) ──────────────────────────────
      if (champ.type_validation === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value).trim())) {
          errors.push(`Le champ '${champ.libelle}' doit être une adresse email valide.`);
          continue;
        }
      } else if (champ.type_validation === "phone") {
        const phoneRegex = /^\+?[0-9]{1,4}?\s?[0-9]{6,15}$/;
        const cleanedPhone = String(value).replace(/\s+/g, "");
        if (!/^\+?[0-9]{7,15}$/.test(cleanedPhone)) {
          errors.push(`Le champ '${champ.libelle}' doit être un numéro de téléphone valide.`);
          continue;
        }
      } else if (champ.type_validation === "number") {
        if (isNaN(Number(value))) {
          errors.push(`Le champ '${champ.libelle}' doit être une valeur numérique.`);
          continue;
        }
      } else if (champ.type_validation === "date") {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          errors.push(`Le champ '${champ.libelle}' doit être une date valide.`);
          continue;
        }
      }

      // ─── VÉRIFICATION D'UNICITÉ ────────────────────────────────────────────────
      if (champ.is_unique === "oui") {
        const query = { [key]: value };
        if (excludeCode) query.code_dynamique = { $ne: excludeCode };
        const existing = await Collection.findOne(query);
        if (existing) {
          errors.push(`La valeur de '${champ.libelle}' (${key}) doit être unique, mais elle existe déjà.`);
          continue;
        }
      }
      dataToSave[key] = value;
    }
  }

  return { dataToSave, errors };
};

// ─── ADD : Enregistrer une donnée dynamique ───────────────────────────────────
exports.registerDynamique = async (req, res) => {
  try {
    const { menu: code_menu, ...formData } = req.body;

    if (!code_menu) {
      return res.status(400).json({
        status: false,
        message: "Le champ 'menu' (code_menu) est requis.",
        data: {},
      });
    }

    // Résoudre le menu
    const menuInfo = await resolveMenu(code_menu);
    if (!menuInfo) {
      return res.status(404).json({
        status: false,
        message: `Le menu "${code_menu}" est introuvable ou n'est pas de type 'dynamique'.`,
        data: {},
      });
    }
    const { menuId, tableName } = menuInfo;

    // Récupérer les champs définis pour ce menu (triés par ordre)
    const champs = await Champ.find({ menu: menuId }).sort({ ordre: 1 });
    if (!champs.length) {
      return res.status(404).json({
        status: false,
        message: `Aucun champ configuré pour le menu '${code_menu}'.`,
        data: {},
      });
    }

    // Construire et valider les données
    const { dataToSave, errors } = await buildAndValidateData(champs, formData, tableName);
    if (errors.length) {
      return res.status(422).json({
        status: false,
        message: "Erreurs de validation.",
        data: { errors },
      });
    }

    // Ajouter les métadonnées
    dataToSave.menu = code_menu;
    dataToSave.code_dynamique = generateToken(16);

    // Créer/récupérer le modèle dynamique et sauvegarder
    const Model =
      mongoose.models[tableName] ||
      mongoose.model(tableName, new mongoose.Schema({}, { strict: false, timestamps: true }));

    const doc = new Model(dataToSave);
    await doc.save();

    const response = doc.toObject();
    delete response._id;
    delete response.__v;

    // Remplacer le champ "menu" string par un objet détaillé
    response.menu = {
      code_menu: menuInfo.code_menu,
      designation: menuInfo.designation,
    };

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

// ─── UPDATE : Mettre à jour une donnée dynamique ──────────────────────────────
exports.updateDynamqique = async (req, res) => {
  try {
    const { code_dynamique } = req.params;
    const { menu: code_menu, ...formData } = req.body;

    if (!code_menu || !code_dynamique) {
      return res.status(400).json({
        status: false,
        message: "Le 'menu' (body) et le 'code_dynamique' (URL) sont requis.",
        data: {},
      });
    }

    // Résoudre le menu
    const menuInfo = await resolveMenu(code_menu);
    if (!menuInfo) {
      return res.status(404).json({
        status: false,
        message: `Le menu "${code_menu}" est introuvable ou n'est pas de type 'dynamique'.`,
        data: {},
      });
    }
    const { menuId, tableName } = menuInfo;

    // Récupérer les champs définis pour ce menu
    const champs = await Champ.find({ menu: menuId }).sort({ ordre: 1 });
    if (!champs.length) {
      return res.status(404).json({
        status: false,
        message: `Aucun champ configuré pour le menu '${code_menu}'.`,
        data: {},
      });
    }

    const Collection = mongoose.connection.collection(tableName);

    // Vérifier que l'enregistrement existe
    const existingDoc = await Collection.findOne({ code_dynamique });
    if (!existingDoc) {
      return res.status(404).json({
        status: false,
        message: "Enregistrement non trouvé.",
        data: {},
      });
    }

    // Construire et valider les données (en excluant le doc courant pour is_unique)
    const { dataToSave, errors } = await buildAndValidateData(champs, formData, tableName, code_dynamique);
    if (errors.length) {
      return res.status(422).json({
        status: false,
        message: "Erreurs de validation.",
        data: { errors },
      });
    }

    if (Object.keys(dataToSave).length === 0) {
      return res.status(400).json({
        status: false,
        message: "Aucune donnée valide fournie pour la mise à jour.",
        data: {},
      });
    }

    await Collection.updateOne({ code_dynamique }, { $set: dataToSave });

    const updatedDoc = await Collection.findOne({ code_dynamique });
    if (updatedDoc) {
      delete updatedDoc._id;
      // Remplacer le champ "menu" string par un objet détaillé
      updatedDoc.menu = {
        code_menu: menuInfo.code_menu,
        designation: menuInfo.designation,
      };
    }

    res.status(200).json({
      status: true,
      message: "Enregistrement mis à jour avec succès.",
      data: updatedDoc,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: {},
    });
  }
};

// ─── GET : Détail d'un enregistrement dynamique ───────────────────────────────
exports.getOneDynamique = async (req, res) => {
  try {
    const { code_dynamique, menu: code_menu } = req.params;

    const menuInfo = await resolveMenu(code_menu);
    if (!menuInfo) {
      return res.status(404).json({
        status: false,
        message: `Le menu "${code_menu}" est introuvable ou n'est pas de type 'dynamique'.`,
        data: {},
      });
    }

    const doc = await fetchOneWhere({ code_dynamique }, menuInfo.tableName);
    if (!doc) {
      return res.status(404).json({
        status: false,
        message: "Enregistrement non trouvé.",
        data: {},
      });
    }

    // Remplacer le champ "menu" string par un objet détaillé
    doc.menu = {
      code_menu: menuInfo.code_menu,
      designation: menuInfo.designation,
    };

    res.status(200).json({
      status: true,
      message: "Succès.",
      data: doc,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: {},
    });
  }
};

// ─── GET : Tous les enregistrements dynamiques d'un menu ─────────────────────
exports.getDynamiqueInfoByMenu = async (req, res) => {
  try {
    const { menu: code_menu } = req.params;

    const menuInfo = await resolveMenu(code_menu);
    if (!menuInfo) {
      return res.status(404).json({
        status: false,
        message: `Le menu "${code_menu}" est introuvable ou n'est pas de type 'dynamique'.`,
        data: [],
      });
    }

    const docs = await fetchAll(menuInfo.tableName);

    if (!docs || docs.length === 0) {
      return res.status(200).json({
        status: true,
        message: "Succès (Aucune donnée trouvée).",
        data: [],
      });
    }

    // Transformer le champ "menu" en objet pour chaque document
    const formattedDocs = docs.map((doc) => ({
      ...doc,
      menu: {
        code_menu: menuInfo.code_menu,
        designation: menuInfo.designation,
      },
    }));

    return res.status(200).json({
      status: true,
      message: "Succès.",
      data: formattedDocs,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: [],
    });
  }
};

// ─── GET : Liste globale des menus dynamiques et leur nombre d'entrées ────────
exports.getDynamiqueListe = async (req, res) => {
  try {
    // Récupérer tous les menus dynamiques qui ont des champs configurés
    const menus = await mongoose
      .model("acl_menus")
      .find({ type: "dynamique" }, "code_menu designation tbl_name");

    const result = await Promise.all(
      menus.map(async (menu, index) => {
        const Collection = mongoose.connection.collection(menu.tbl_name);
        const count = await Collection.countDocuments();
        return {
          position: index + 1,
          code_menu: menu.code_menu,
          designation: menu.designation,
          tbl_name: menu.tbl_name,
          total_enregistrements: count,
        };
      })
    );

    res.status(200).json({
      status: true,
      message: "Succès.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Une erreur interne est survenue.",
      data: [],
    });
  }
};

// ─── DELETE : Supprimer un enregistrement dynamique ───────────────────────────
exports.deleteDynamque = async (req, res) => {
  try {
    const { code_dynamique, menu: code_menu } = req.params;

    const menuInfo = await resolveMenu(code_menu);
    if (!menuInfo) {
      return res.status(400).json({
        status: false,
        message: "Table de destination introuvable pour ce menu.",
        data: {},
      });
    }

    const Collection = mongoose.connection.collection(menuInfo.tableName);

    const doc = await Collection.findOne({ code_dynamique });
    if (!doc) {
      return res.status(404).json({
        status: false,
        message: "Élément non trouvé.",
        data: {},
      });
    }

    await Collection.deleteOne({ code_dynamique });

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
