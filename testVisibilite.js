const mongoose = require('mongoose');
const { Dossier } = require('./src/dossier/models/dossier.model');
const { Administrateur } = require('./src/admin/models/admin.model');

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/transit', { family: 4 });
    const ouvreur = await Administrateur.findOne({ email: 'ouvreur@transit.com' });
    
    const dossier = new Dossier({
        num_dossier: 'TEST-0001',
        client: ouvreur._id,
        etat_dossier: 'OUVERT',
        intervenants: [{
            role: 'OUVREUR',
            utilisateur: ouvreur._id
        }]
    });
    await dossier.save();
    console.log("Dossier sauvegardé.");

    const dossiersOuvreur = await Dossier.find({ 'intervenants.utilisateur': ouvreur._id });
    console.log("Dossiers trouvés pour ouvreur:", dossiersOuvreur.length);

    mongoose.connection.close();
}
test();
