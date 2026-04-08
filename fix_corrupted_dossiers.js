require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/db');
const { Dossier } = require('./src/dossier/models/dossier.model');

async function fixDB() {
    try {
        await connectDB();
        console.log("Connecté à la BD, recherche de dossiers corrompus...");

        const dossiers = await Dossier.find();
        let fixedCount = 0;

        for (const doc of dossiers) {
            // Mongoose might have kept the invalid ObjectId in memory or it might block saving.
            // We can check it with the raw DB layer.
            const rawDoc = await mongoose.connection.db.collection('acl_dossiers').findOne({ _id: doc._id });
            if (rawDoc && rawDoc.expediteur && typeof rawDoc.expediteur === 'string') {
                if (!mongoose.Types.ObjectId.isValid(rawDoc.expediteur)) {
                    console.log(`Fixing dossier ${rawDoc.num_dossier} with invalid expediteur: ${rawDoc.expediteur}`);
                    await mongoose.connection.db.collection('acl_dossiers').updateOne(
                        { _id: rawDoc._id },
                        { $unset: { expediteur: "" } }
                    );
                    fixedCount++;
                }
            }
        }

        console.log(`Opération terminée. ${fixedCount} dossier(s) corrigé(s).`);
        process.exit(0);
    } catch (e) {
        console.error("Erreur:", e);
        process.exit(1);
    }
}

fixDB();
