const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); // Importa los middlewares
const { addVehicle, removeVehicle, getVehicles, getReports } = require('../controllers/vehicleController'); // Importa las funciones del controlador

// Rutas protegidas:

// Ruta para añadir un vehículo: Requiere autenticación y rol de 'employee' o 'admin'
router.post('/', protect, authorize('employee', 'admin'), addVehicle);

// Ruta para eliminar un vehículo: Requiere autenticación y rol de 'employee' o 'admin'
router.delete('/:id', protect, authorize('employee', 'admin'), removeVehicle);

// Ruta para obtener todos los vehículos: Requiere solo autenticación (cualquier rol)
router.get('/', protect, getVehicles);

// Ruta para obtener reportes: Requiere autenticación y rol de 'admin'
router.get('/reports', protect, authorize('admin'), getReports);

module.exports = router;