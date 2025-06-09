// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
// Asegúrate de importar la nueva función del controlador
const { createUserByAdmin, createUserByEmployee, getUsers, getEmployees, updateUser } = require('../controllers/userController');

// Rutas para la gestión de usuarios por ADMINISTRADOR
// Estas rutas solo son accesibles por 'admin'
router.post('/users', protect, authorize('admin'), createUserByAdmin); // Admin puede crear user/employee
router.get('/users', protect, authorize('admin'), getUsers); // Admin puede ver todos los usuarios
router.get('/employees', protect, authorize('admin'), getEmployees);
router.put('/users/:id', protect, authorize('admin'), updateUser);
// --- NUEVA RUTA: Para la creación de usuarios normales por EMPLEADOS ---
// Esta ruta es accesible por 'employee' o 'admin'
// Pero la lógica en createUserByEmployee forzará el rol a 'user'
router.post('/employee-users', protect, authorize('employee', 'admin'), createUserByEmployee);

module.exports = router;