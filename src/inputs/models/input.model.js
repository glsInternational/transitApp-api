const mongoose = require("mongoose");
const { generateToken } = require("../../../utils/utils");

const champSchema = new mongoose.Schema(
  {
    // ─── Relation avec le menu (acl_menus) ───────────────────────────────────
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "acl_menus",
      required: [true, "Le menu est obligatoire."],
      validate: {
        validator: async function (value) {
          // Vérifie que le menu existe et qu'il est de type 'dynamique'
          const menu = await mongoose.model("acl_menus").findOne({
            _id: value,
            type: "dynamique",
          });
          return !!menu;
        },
        message: (props) =>
          `Accès refusé : Le menu "${props.value}" est inexistant ou n'est pas de type 'dynamique'.`,
      },
    },

    // ─── Visibilité par rôle ─────────────────────────────────────────────────
    visible_par: {
      type: Array,
      required: true,
      default: ["*"], // "*" = visible par tous les rôles
    },

    // ─── Informations du champ ───────────────────────────────────────────────
    libelle: { type: String, required: true, trim: true },

    // Identifiant technique unique (snake_case), unique par menu (index composé)
    id_champ: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Règle : uniquement minuscules, chiffres ou underscores (ex: nom_client_1)
          return /^[a-z0-9_]+$/.test(v);
        },
        message: (props) =>
          `'${props.value}' n'est pas un identifiant valide. Utilisez uniquement des minuscules, des chiffres et des underscores (ex: nom_client_1).`,
      },
    },

    // ─── Type du champ (HTML/UI) ─────────────────────────────────────────────
    type_champ: {
      type: String,
      required: [true, "Le type de champ est obligatoire."],
      trim: true,
      enum: {
        values: ["text", "number", "password", "textarea", "select", "multi-select", "date", "file"],
        message: "`{VALUE}` n'est pas un type de champ valide.",
      }
    },

    // Extensions acceptées — uniquement pertinent si type_champ === "file"
    acceptedFileTypes: {
      type: Array,
      validate: {
        validator: function (v) {
          if (this.type_champ !== "file") {
            return !v || v.length === 0;
          }
          return true;
        },
        message: "'acceptedFileTypes' ne peut être renseigné que pour un champ de type 'file'.",
      },
    },

    // ─── Comportement du champ ───────────────────────────────────────────────

    // Indique si la valeur de ce champ doit être unique dans la table dynamique
    is_unique: {
      type: String,
      required: [true, "Le champ 'is_unique' est obligatoire."],
      enum: {
        values: ["oui", "non"],
        message: "La valeur doit être 'oui' ou 'non'."
      },
      default: "non",
    },

    // Indique si ce champ est affiché dans le tableau côté front-end
    afficher_tableau: {
      type: String,
      required: [true, "Le champ 'afficher_tableau' est obligatoire."],
      enum: {
        values: ["oui", "non"],
        message: "La valeur doit être 'oui' ou 'non'."
      },
      default: "oui",
    },

    // Validation de format appliquée à la valeur saisie
    type_validation: {
      type: String,
      enum: {
        values: ["email", "phone", "number", "date", ""],
        message: "`{VALUE}` n'est pas une option de validation valide.",
      },
      default: "",
    },

    // Options pour les champs de type select ou multi-select
    options: {
      type: [
        {
          label: { type: String, required: true },
          value: { type: String, required: true },
        },
      ],
      default: [],
    },

    // Ordre d'affichage du champ — unique par menu (index composé)
    ordre: { type: String, required: true, trim: true },

    commentaire: { type: String, trim: true },

    obligatoire: {
      type: String,
      required: [true, "Le choix du caractère obligatoire est requis."],
      enum: {
        values: ["oui", "non"],
        message: "La valeur doit être 'oui' ou 'non'."
      },
    },

    // ─── Identifiant technique interne ───────────────────────────────────────
    code_champ: {
      type: String,
      required: true,
      unique: true,
      default: () => generateToken(16),
    },

    // ─── Métadonnées ─────────────────────────────────────────────────────────
    status: {
      type: String,
      default: "1",
      enum: ["0", "1", "-1"], // 0 = Inactif, 1 = Actif, -1 = Suspendu
    },
    corbeille: {
      type: String,
      default: "0",
      enum: ["0", "1", "-1"], // 0 = Non supprimé, 1 = Supprimé, -1 = Archivage spécial
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index composés ──────────────────────────────────────────────────────────
// id_champ unique PAR menu (pas globalement)
champSchema.index({ id_champ: 1, menu: 1 }, { unique: true });
// ordre unique PAR menu (pas globalement)
champSchema.index({ ordre: 1, menu: 1 }, { unique: true });

// ─── Méthode d'instance : formatage de la réponse API ────────────────────────
champSchema.methods.formatResponse = async function () {
  // Populate le menu si pas déjà fait
  await this.populate("menu", "designation code_menu");

  const champData = this.toObject({ virtuals: true });
  delete champData._id;
  delete champData.__v;

  // Aplatir les informations du menu dans la réponse
  if (champData.menu && typeof champData.menu === "object") {
    champData.menuName = champData.menu.designation || "";
    champData.menuCode = champData.menu.code_menu || "";
    champData.menu = champData.menu._id; // Garder l'ObjectId pour référence
  } else {
    champData.menuName = "";
    champData.menuCode = "";
  }

  return champData;
};

const Champ = mongoose.model("acl_champs", champSchema);
module.exports.Champ = Champ;
