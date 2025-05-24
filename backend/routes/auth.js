const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Función para generar un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // El token expirará en 1 hora
    });
};

// Ruta de Registro de Usuario
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body; // <-- RECIBE EL EMAIL

    if (!username || !email || !password) { // <-- VALIDA EL EMAIL TAMBIÉN
        return res.status(400).json({ message: 'Por favor, introduce usuario, email y contraseña.' });
    }

    try {
        // Validación de unicidad de username y email (Mongoose lo maneja con `unique: true`)
        // Pero es bueno tener un chequeo previo para mensajes más específicos
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'El nombre de usuario ya existe.' });
        }
        const emailExists = await User.findOne({ email }); // <-- CHEQUEA UNICIDAD DEL EMAIL
        if (emailExists) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

        // El rol 'user' se asigna por defecto
        const user = await User.create({ username, email, password }); // <-- GUARDA EL EMAIL

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email, // <-- INCLUYE EL EMAIL EN LA RESPUESTA (opcional pero útil)
                role: user.role,
                token: generateToken(user._id),
                message: 'Registro exitoso.'
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos.' });
        }
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        // Manejo específico para errores de unicidad de Mongoose (código 11000)
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.username) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
            }
            if (error.keyPattern && error.keyPattern.email) {
                return res.status(400).json({ message: 'El email ya está registrado.' });
            }
        }
        // Manejo para errores de validación de Mongoose (ej. formato de email)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
});

// Ruta de Inicio de Sesión (NO necesita cambios si solo usas username y password)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Por favor, introduce usuario y contraseña.' });
    }

    try {
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email, // <-- INCLUYE EL EMAIL EN LA RESPUESTA DE LOGIN
                role: user.role,
                token: generateToken(user._id),
                message: 'Inicio de sesión exitoso.'
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }
    } catch (error) {
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
});

module.exports = router;