// backend/routes/vehicleRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createVehicle,
    getAllVehicles,
    getAvailableVehicles,
    updateVehicleStatus,
    getReports
} = require('../controllers/vehicleController');


// --- Rutas de Vehículos Accesibles por CUALQUIER usuario (incluso no logueados) ---
router.get('/', getAvailableVehicles);


// --- Rutas de Gestión de Vehículos (Requieren autenticación y roles específicos) ---

// Ruta para CREAR un nuevo vehículo: Requiere autenticación y rol de 'admin'
// ¡CORRECCIÓN AQUÍ! Pasa los roles directamente sin un array externo
router.post('/', protect, authorize('admin'), createVehicle);

// Ruta para OBTENER TODOS los vehículos (para el panel de admin/empleado)
// ¡CORRECCIÓN AQUÍ! Pasa los roles directamente sin un array externo
router.get('/all', protect, authorize('admin', 'employee'), getAllVehicles);

// Ruta para ACTUALIZAR el estado de un vehículo (mantenimiento o disponibilidad)
// ¡CORRECCIÓN AQUÍ! Pasa los roles directamente sin un array externo
router.put('/:id/status', protect, authorize('admin', 'employee'), updateVehicleStatus);


// --- Rutas de Reportes (Si aplica, solo para Admin) ---
// ¡CORRECCIÓN AQUÍ! Pasa los roles directamente sin un array externo
router.get('/reports', protect, authorize('admin'), getReports);


// --- Rutas antiguas/obsoletas - Considera eliminarlas si ya no las necesitas ---
// (Estas líneas deben seguir comentadas o eliminadas, no las descomentes)
// router.post('/', protect, authorize(['employee', 'admin']), addVehicle);
// router.delete('/:id', protect, authorize(['employee', 'admin']), removeVehicle);
// router.get('/', protect, getVehicles);

module.exports = router;