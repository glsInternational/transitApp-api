const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Profile } = require('../profile/models/profile.model');
const { Administrateur } = require('../admin/models/admin.model');

async function seedUsers() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/transit', { family: 4 });
        console.log('Connecté à la base de données transit');

        const hashedPassword = await bcrypt.hash('password123', 10);

        const usersToCreate = [
            { email: 'ouvreur@transit.com', nom: 'Doe', prenom: 'John (Ouvreur)', roleCode: 'OUVREUR', phone: '+225 0100000001' },
            { email: 'chef@transit.com', nom: 'Smith', prenom: 'Alice (Chef Transit)', roleCode: 'CHEF_TRANSIT', phone: '+225 0100000002' },
            { email: 'declarant@transit.com', nom: 'Martin', prenom: 'Paul (Déclarant)', roleCode: 'DECLARANT', phone: '+225 0100000003' },
            { email: 'operatrice@transit.com', nom: 'Dupont', prenom: 'Marie (Saisie)', roleCode: 'OPERATEUR_SAISIE', phone: '+225 0100000004' },
            { email: 'passeur@transit.com', nom: 'Kone', prenom: 'Ibrahim (Passeur)', roleCode: 'PASSEUR_DOUANE', phone: '+225 0100000005' },
            { email: 'facturation@transit.com', nom: 'Leroy', prenom: 'Sophie (Facturation)', roleCode: 'FACTURATION', phone: '+225 0100000006' }
        ];

        for (const u of usersToCreate) {
            const profile = await Profile.findOne({ code_profile: u.roleCode });
            if (!profile) {
                console.log(`Profil ${u.roleCode} introuvable, skip.`);
                continue;
            }

            const existingUser = await Administrateur.findOne({ email: u.email });
            if (existingUser) {
                console.log(`L'utilisateur ${u.email} existe déjà.`);
                continue;
            }

            const newUser = new Administrateur({
                nom: u.nom,
                prenom: u.prenom,
                email: u.email,
                genre: "Masculin",
                telephone: u.phone,
                password: hashedPassword,
                profile: u.roleCode,
                status: '1'
            });

            await newUser.save();
            console.log(`✅ Utilisateur ${u.email} créé avec succès (Rôle: ${u.roleCode}).`);
        }

        console.log('--- Fin de la création des utilisateurs ---');
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedUsers();
