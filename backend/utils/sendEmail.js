// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); // Asegúrate de cargar las variables de entorno aquí también si no lo haces globalmente en server.js

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Función para enviar correos electrónicos.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} htmlContent - Contenido HTML del correo.
 * @returns {Promise<Object>} Información del resultado del envío del correo.
 */
const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  try {
    console.log(`DEBUG [sendEmail utility]: Intentando transporter.sendMail a ${to}`); // <-- NUEVO LOG 4
    const info = await transporter.sendMail(mailOptions);
    console.log('DEBUG [sendEmail utility]: Email enviado con éxito. MessageId: %s', info.messageId); // <-- ¡BUSCA ESTE ID!
    // console.log('DEBUG [sendEmail utility]: Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Solo si usas ethereal.email
    console.log('Email enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar email:', error);
    // Es buena idea relanzar el error o manejarlo de alguna manera
    // para que la función que llama sepa que falló el envío.
    throw new Error('No se pudo enviar el correo electrónico.');
  }
};

module.exports = sendEmail;