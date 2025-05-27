// backend/routes/vehicleRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); // Aún necesitamos protect/authorize para otras rutas
const {
    createVehicle,
    getAllVehicles,
    getAvailableVehicles, // Esta es la función que queremos hacer pública
    addVehicle,
    removeVehicle,
    getVehicles,
    getReports
} = require('../controllers/vehicleController');

// --- Rutas de Gestión de Vehículos (Requieren roles específicos) ---

// Ruta para CREAR un nuevo vehículo: Requiere autenticación y rol de 'admin'
router.post('/', protect, authorize('admin'), createVehicle);

// Ruta para OBTENER TODOS los vehículos (para el panel de admin/empleado): Requiere autenticación y rol de 'employee' o 'admin'
router.get('/all', protect, authorize('employee', 'admin'), getAllVehicles);

// Ruta para obtener reportes (si sigue aquí, si no, se iría a adminRoutes.js)
router.get('/reports', protect, authorize('admin'), getReports);

// --- Rutas Públicas/Generales (solo requieren autenticación) ---

// *********** MODIFICACIÓN CRÍTICA AQUÍ ***********
// Ruta para obtener VEHÍCULOS DISPONIBLES (para la página principal/Home):
// YA NO REQUIERE 'protect', ¡AHORA ES PÚBLICA!
router.get('/', getAvailableVehicles); // <-- Eliminado 'protect'

// Las rutas simuladas viejas que tenías, si todavía las necesitas y no chocan:
router.post('/', protect, authorize('employee', 'admin'), addVehicle);
router.delete('/:id', protect, authorize('employee', 'admin'), removeVehicle);
router.get('/', protect, getVehicles);

module.exports = router;