// backend/routes/reservationRoutes.js

const express = require('express');
const router = express.Router();

const {
  createReservation,
  getMyReservations,
  getReservationById,
  //payReservation,
} = require('../controllers/reservationController');

// ¡¡¡¡AÑADE ESTA LÍNEA PARA IMPORTAR EL CONTROLADOR DE PAGOS!!!!
const { processReservationPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

console.log('Valor de protect en reservationRoutes.js:', typeof protect, protect); // Deja este console.log
// AÑADE ESTE CONSOLE.LOG JUSTO AQUÍ:
console.log('Valor de processReservationPayment en reservationRoutes.js:', typeof processReservationPayment, processReservationPayment);

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
// ¡¡¡¡USA AHORA LA FUNCIÓN CORRECTA!!!!
router.route('/:id/pay').post(protect, processReservationPayment); // <--- ¡¡¡CAMBIO CRÍTICO AQUÍ!!!

// Detalle reserva
router.route('/:id').get(protect, getReservationById);             // COMENTA ESTA LÍNEA



module.exports = router;