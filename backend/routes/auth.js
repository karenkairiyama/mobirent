const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Función para generar un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h', // El token expirará en 1 hora
  });
};

// ---------------------------------------------------
// Configuración de Nodemailer
// ---------------------------------------------------
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // ej: 'gmail', 'Outlook', 'SendGrid'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ruta de Registro de Usuario (NO necesita cambios aquí para el rol por defecto)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Por favor, introduce usuario y contraseña.' });
  }

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }

    // El rol 'user' se asigna por defecto gracias al modelo User.js
    const user = await User.create({ username, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role, // <-- INCLUYE EL ROL EN LA RESPUESTA
        token: generateToken(user._id),
        message: 'Registro exitoso.',
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos.' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'El nombre de usuario ya está en uso.' });
    }
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
});

// Ruta de Inicio de Sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Por favor, introduce usuario y contraseña.' });
  }

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role, // <-- INCLUYE EL ROL EN LA RESPUESTA
        token: generateToken(user._id),
        message: 'Inicio de sesión exitoso.',
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas.' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error del servidor: ${error.message}` });
  }
});

// ---------------------------------------------------
// Ruta para solicitar el restablecimiento de contraseña
// ---------------------------------------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'El email es requerido.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, siempre responde con un mensaje genérico
      return res.status(200).json({
        message:
          'Si el email está registrado, se enviará un enlace de restablecimiento de contraseña.',
      });
    }

    // Generar un token único y seguro (usando JWT).
    // NOTA: Usa JWT_SECRET aquí.
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora en milisegundos
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Solicitud de Restablecimiento de Contraseña para MobiRent',
      html: `
                <p>Estimado/a ${user.username || user.email},</p>
                <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta MobiRent.</p>
                <p>Por favor, haga clic en el siguiente enlace para continuar con el proceso:</p>
                <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer mi Contraseña</a>
                <p>Este enlace es válido por **1 hora**.</p>
                <p>Si usted no solicitó este restablecimiento, por favor ignore este correo.</p>
                <p>Saludos cordiales,</p>
                <p>El equipo de MobiRent</p>
            `,
    });

    res.status(200).json({
      message:
        'Si el email está registrado, se ha enviado un enlace de restablecimiento de contraseña.',
    });
  } catch (error) {
    console.error('Error en /forgot-password:', error);
    res.status(500).json({
      message:
        'Error interno del servidor al procesar la solicitud de recuperación de contraseña.',
    });
  }
});

module.exports = router;
