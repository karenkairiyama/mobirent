// backend/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Crear un transporter de Nodemailer
  // Usa un servicio como Mailtrap para desarrollo o SendGrid/Mailgun para producción.
  // Asegúrate de configurar tus variables de entorno para las credenciales.
  // Ejemplo con Mailtrap (para desarrollo):
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io', // Por ejemplo, 'smtp.mailtrap.io'
    port: process.env.EMAIL_PORT || 2525, // Por ejemplo, 2525
    auth: {
      user: process.env.EMAIL_USERNAME, // Tu usuario de Mailtrap/servicio SMTP
      pass: process.env.EMAIL_PASSWORD, // Tu contraseña de Mailtrap/servicio SMTP
    },
  });

  // 2. Definir las opciones del email
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Mobirent <noreply@mobirent.com>', // Tu email de origen
    to: options.email, // Email del destinatario
    subject: options.subject, // Asunto del email
    html: options.html, // Contenido HTML del email (para el voucher)
  };

  // 3. Enviar el email
  await transporter.sendMail(mailOptions);
  console.log(`Email enviado a ${options.email} con asunto: ${options.subject}`);
};

module.exports = sendEmail;