// backend/routes/reservationRoutes.js

const express = require('express');
const router = express.Router();

const {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation

} = require('../controllers/reservationController');


const { processReservationPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');


// Nueva ruta para crear una reserva
router.route('/').post(protect, createReservation); 

// Rutas para historial de reservas
router.route('/myreservations').get(protect, getMyReservations); 

// Detalle reserva

router.route('/:id').get(protect, getReservationById).delete(protect, cancelReservation);             // COMENTA ESTA LÍNEA


// Pagar reserva

router.route('/:id/pay').post(protect, processReservationPayment); 


module.exports = router;