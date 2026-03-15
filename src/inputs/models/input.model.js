const mongoose = require("mongoose");
const { generateToken } = require("../../../utils/utils");
const { fetchOneValue } = require("../../../services/requetes");


const champSchema = new mongoose.Schema(
  {
    menu: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: async function (value) {
          // On vérifie si ce code_profile existe dans la collection acl_profiles
          const profile = await mongoose.model('acl_menus').findOne({ code_menu: value, type: 'dynamique' });
          return !!profile; // Retourne true si le profil existe, sinon false
        },
        message: props => `Accès refusé : Le code menu "${props.value}" est inexistant.`
      }
    },
    visible_par: {
      type: Array,
      required: true,
      default: "*",
    },
    libelle: { type: String, required: true, trim: true },
    id_champ: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Règle : Commence par une lettre, contient uniquement minuscules, chiffres ou underscores
          // Pas d'espaces, pas d'accents, pas de majuscules.
          return /^[a-z0-9_]+$/.test(v);
        },
        message: props =>
          `'${props.value}' n'est pas un identifiant valide. Utilisez uniquement des minuscules, des chiffres et des underscores (ex: nom_client_1).`
      }
    },
    type_champ: {
      type: String,
      required: true,
      trim: true,
      enum: ["text", "number", "password", "textarea", "select", "multi-select", "date", "file"]
    },
    acceptedFileTypes: {
      type: Array
    },
    colonne: {
      type: String,
      required: true,
      enum: ["not-all", "all"],
      default: "all"
    },
    // is_unique: {
    //   type: String,
    //   required: [true, "Le champ unique est obligatoire"], // Message personnalisé pour débugger
    //   enum: ["oui", "non"],
    // },
    type_validation: {
      type: String,
      enum: ["email", "phone", "number"]
    },
    ordre: { type: String, required: true, trim: true, unique: true },
    commentaire: { type: String, trim: true },
    obligatoire: {
      type: String,
      required: true,
      enum: ["oui", "non"],
    },
    code_champ: {
      type: String,
      required: true,
      unique: true,
      default: () => generateToken(16),
    },
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

// Méthode d'instance pour formater la réponse
champSchema.methods.formatResponse = async function () {
  const champData = this.toObject();
  delete champData._id;
  delete champData.__v;

  champData.menuName = champData.menu
    ? (await fetchOneValue(
      { code_menu: champData.menu },
      "designation",
      "acl_menus"
    )) || ""
    : "";

  return champData;
};

const Champ = mongoose.model("acl_champs", champSchema);
module.exports.Champ = Champ;
