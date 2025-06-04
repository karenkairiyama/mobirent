// backend/routes/reservationRoutes.js

const express = require('express');
const router = express.Router();

const {
  createReservation,
  getMyReservations,
  getReservationById,
} = require('../controllers/reservationController');

const { protect, authorize } = require('../middleware/authMiddleware');

console.log('Valor de protect en reservationRoutes.js:', typeof protect, protect); // Deja este console.log

// Rutas para historial de reservas
router.route('/myreservations').get(protect, getMyReservations); // COMENTA ESTA LÍNEA
router.route('/:id').get(protect, getReservationById);             // COMENTA ESTA LÍNEA

// *** RUTA DE PRUEBA TEMPORAL ***
router.get('/test-route', (req, res) => {
    res.send('Test route works!');
});
// *******************************

// Nueva ruta para crear una reserva
router.route('/').post(protect, createReservation); // Deja esta línea por ahora

module.exports = router;