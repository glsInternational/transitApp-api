const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    designation: String,
    type: String,
    route: String,
    svg: String,
    ordre: String,
    code_menu: { type: String, unique: true },
    parent: String,
    status: { type: String, default: '1' },
    corbeille: { type: String, default: '0' }
}, { timestamps: true });

const Menu = mongoose.model('acl_menus', menuSchema);

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/transit');
        console.log('Connecté à MongoDB.');

        const dossiersParent = {
            designation: 'Gestion Dossiers',
            type: 'parent',
            route: '',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
            ordre: '10',
            code_menu: 'menu_dossiers',
            parent: '',
            status: '1',
            corbeille: '0'
        };

        const listDossierChild = {
            designation: 'Liste des Dossiers',
            type: 'enfant',
            route: '/dossiers',
            svg: '',
            ordre: '1',
            code_menu: 'child_list_dossiers',
            parent: 'menu_dossiers',
            status: '1',
            corbeille: '0'
        };

        const addDossierChild = {
            designation: 'Ouvrir un Dossier',
            type: 'enfant',
            route: '/add-dossier',
            svg: '',
            ordre: '2',
            code_menu: 'child_add_dossier',
            parent: 'menu_dossiers',
            status: '1',
            corbeille: '0'
        };

        // Supprimer si déjà existant pour éviter les doublons lors des tests
        await Menu.deleteMany({ code_menu: { $in: ['menu_dossiers', 'child_list_dossiers', 'child_add_dossier'] } });
        
        await Menu.insertMany([dossiersParent, listDossierChild, addDossierChild]);
        console.log('Menus Dossiers insérés avec succès.');

        // On doit aussi les ajouter au profil "Admin" ou autre pour qu'il les voie !
        // Mais pour l'instant, ProtectedRoute check si l'URL est dans la liste des menus AUTORISÉS par le profil.
        // Si ces menus ne sont pas dans acl_privilege_profiles pour le profil de l'utilisateur, ça bloquera encore.
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
