const express = require('express');
const router = express.Router();
const {
  createAdicional,
  getAdicionales,
  getAdicionalById,
  updateAdicional,
  deleteAdicional,
  getAdicionalesAvailable,
} = require('../controllers/adicionalController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Middleware de autenticación y autorización

router.route('/available').get(protect, getAdicionalesAvailable);
// Rutas para crear y obtener todos los adicionales
// POST /api/adicionales (solo admin puede crear)
// GET /api/adicionales (solo admin puede ver todos para gestión, o cualquiera si es para selección en reserva)
router
  .route('/')
  .post(protect, authorize('admin'), createAdicional) // Solo administradores pueden crear adicionales
  .get(protect, authorize('admin'), getAdicionales); // Solo administradores pueden ver la lista completa para gestión

// Rutas para obtener, actualizar y eliminar un adicional específico por ID
// GET /api/adicionales/:id (solo admin)
// PUT /api/adicionales/:id (solo admin)
// DELETE /api/adicionales/:id (solo admin)
router
  .route('/:id')
  .get(protect, authorize('admin'), getAdicionalById)
  .put(protect, authorize('admin'), updateAdicional)
  .delete(protect, authorize('admin'), deleteAdicional);

module.exports = router;