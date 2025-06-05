// backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { processReservationPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/payments/:reservationId → procesar pago de esa reserva
router.post('/:reservationId', protect, processReservationPayment);

module.exports = router;
