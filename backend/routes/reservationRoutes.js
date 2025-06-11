// backend/routes/reservationRoutes.js

const express = require('express');
const router = express.Router();

const {
  createReservation,
  getMyReservations,
  getReservationById,
  payReservation,
  cancelReservation
} = require('../controllers/reservationController');

const { protect, authorize } = require('../middleware/authMiddleware');

console.log('Valor de protect en reservationRoutes.js:', typeof protect, protect); // Deja este console.log
// *** RUTA DE PRUEBA TEMPORAL ***
router.get('/test-route', (req, res) => {
    res.send('Test route works!');
});
// *******************************

// Nueva ruta para crear una reserva
router.route('/').post(protect, createReservation); // Deja esta línea por ahora

// Rutas para historial de reservas
router.route('/myreservations').get(protect, getMyReservations); // COMENTA ESTA LÍNEA

// Pagar reserva
router.route('/:id/pay').post(protect, payReservation);

// Detalle reserva
router.route('/:id').get(protect, getReservationById).delete(protect, cancelReservation);             // COMENTA ESTA LÍNEA



module.exports = router;