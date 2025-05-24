// backend/controllers/userController.js

const User = require('../models/User');

// @desc    Crear un nuevo usuario (solo para admin, con asignación de rol)
// @route   POST /api/admin/users
// @access  Admin
const createUserByAdmin = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Por favor, proporciona usuario, contraseña y rol.' });
    }

    // El admin puede crear 'user' o 'employee'.
    // Si necesitas que el admin cree otros admins, ajusta esta línea.
    if (!['user', 'employee'].includes(role)) {
        return res.status(400).json({ message: 'Rol inválido. Los roles permitidos son "user" o "employee".' });
    }

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe.' });
        }

        const user = await User.create({ username, password, role });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                message: `Usuario ${username} creado con rol ${role} exitosamente.`
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos.' });
        }

    } catch (error) {
        console.error('Error al crear usuario por admin:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc    Crear un nuevo usuario (solo para employee y admin, con rol 'user' forzado)
// @route   POST /api/employee/users
// @access  Employee, Admin
const createUserByEmployee = async (req, res) => {
    const { username, password } = req.body; // El rol no se toma del body, se fuerza a 'user'

    if (!username || !password) {
        return res.status(400).json({ message: 'Por favor, proporciona usuario y contraseña.' });
    }

    // Forzar el rol a 'user' para esta ruta
    const role = 'user';

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe.' });
        }

        const user = await User.create({ username, password, role });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role, // Siempre será 'user' aquí
                message: `Usuario ${username} creado con rol ${role} exitosamente.`
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos.' });
        }

    } catch (error) {
        console.error('Error al crear usuario por empleado:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};


// @desc    Obtener todos los usuarios (solo para admin)
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Excluir contraseñas
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

module.exports = {
    createUserByAdmin,
    createUserByEmployee, // ¡NUEVO!
    getUsers,
};