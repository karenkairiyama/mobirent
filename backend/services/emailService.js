// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Configurar el transportador con las variables de entorno (.env)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // por ejemplo "gmail"
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envía un email sencillo con asunto y HTML.
 * @param {string} to       - Dirección de destino (email del usuario)
 * @param {string} subject  - Asunto del correo
 * @param {string} html     - Contenido HTML del correo
 */
async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
