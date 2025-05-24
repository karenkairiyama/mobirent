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

// Ruta de Registro de Usuario (NO necesita cambios aquí para el rol por defecto)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Por favor, introduce usuario y contraseña.' });
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
                message: 'Registro exitoso.'
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos.' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
});

// Ruta de Inicio de Sesión
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
                role: user.role, // <-- INCLUYE EL ROL EN LA RESPUESTA
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