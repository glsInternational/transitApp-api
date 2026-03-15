const nodemailer = require('nodemailer');

/**
 * Service pour l'envoi d'emails via SMTP Avelo
 * Remplace avantageusement le helper PHP envoie_email_helper_avelo
 */
const transporter = nodemailer.createTransport({
    host: 'webmail.aveloapp.com',
    port: 587,
    secure: false, // false pour le port 587 (TLS)
    auth: {
        user: 'info@aveloapp.com',
        pass: '6Jnlf4SZ5tdNpM3*'
    },
    tls: {
        rejectUnauthorized: false // Aide à éviter les erreurs de certificat sur certains serveurs SMTP
    }
});

/**
 * Fonction d'envoi d'email
 * @param {string} to - Destinataire(s)
 * @param {string} subject - Sujet de l'email
 * @param {string} html - Contenu HTML (ton template chargé)
 */
exports.sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: '"Avelo App" <info@aveloapp.com>',
            to: to,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé: ' + info.response);
        return true;
    } catch (error) {
        console.error('Erreur SMTP détaillée:', error);
        return false;
    }
};