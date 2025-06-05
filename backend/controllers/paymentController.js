// backend/controllers/paymentController.js

const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const fakePaymentService = require('../services/fakePaymentService');

/**
 * @desc   Procesar el pago de una reserva existente
 * @route  POST /api/payments/:reservationId
 * @access Private (User)
 */
const processReservationPayment = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const { paymentData } = req.body;

  if (!paymentData) {
    res.status(400);
    throw new Error('Los datos de pago (paymentData) son obligatorios.');
  }

  // 1. Verificar que la reserva exista
  const reservation = await Reservation.findById(reservationId).populate('vehicle');
  if (!reservation) {
    res.status(404);
    throw new Error('Reserva no encontrada.');
  }

  // 2. Solo permitir pago si la reserva está en "pending"
  if (reservation.status !== 'pending') {
    res.status(400);
    throw new Error('Solo se puede pagar una reserva en estado "pending".');
  }

  // 3. Verificar que no hayan pasado más de 30 minutos desde createdAt
  const now = new Date();
  const createdAt = reservation.createdAt;
  const thirtyMinutes = 30 * 60 * 1000;
  if (now - createdAt > thirtyMinutes) {
    // Luego de 30 min, liberar vehículo y marcar reserva como cancelada
    reservation.status = 'cancelled';
    reservation.paymentInfo.status = 'pending';
    await reservation.save();

    // Si el vehículo estaba bloqueado antes, liberarlo
    if (reservation.vehicle.isReserved) {
      reservation.vehicle.isReserved = false;
      await reservation.vehicle.save();
    }

    res.status(400);
    throw new Error('Tiempo de pago expirado (30 min). La reserva ha sido cancelada.');
  }

  // 4. Procesar el pago simulado
  let paymentResult;
  try {
    paymentResult = await fakePaymentService.processPayment(paymentData, reservation.totalCost);
  } catch (err) {
    console.error('Error técnico al llamar a fakePaymentService:', err);
    res.status(500);
    throw new Error('Error técnico, intente más tarde.');
  }

  // 5. Según el estado del fakePaymentService:
  if (paymentResult.status === 'rejected') {
    // a) Pago rechazado → mantener estado "pending"
    reservation.paymentInfo = {
      transactionId: paymentResult.transactionId,
      method: paymentData.method || 'credit_card',
      status: 'rejected',
    };
    await reservation.save();

    res.status(400).json({ message: 'Pago rechazado, intenta nuevamente o usa otra tarjeta.' });
    return;
  }

  // 6. Si status === 'approved', confirmar reserva:
  if (paymentResult.status === 'approved') {
    // a) Cambiar reserva a "confirmed"
    reservation.status = 'confirmed';
    reservation.paymentInfo = {
      transactionId: paymentResult.transactionId,
      method: paymentData.method || 'credit_card',
      status: 'approved',
    };
    await reservation.save();

    // b) Marcar el vehículo como reservado
    const vehicle = await Vehicle.findById(reservation.vehicle._id);
    if (vehicle) {
      vehicle.isReserved = true;
      await vehicle.save();
    }

    // c) Enviar voucher por email
    //      - Memo: req.user no está disponible aquí, pero podemos buscar al usuario asociado:
    const user = await User.findById(reservation.user);
    if (user) {
      const voucherHtml = `
        <h1>Confirmación de Pago y Reserva Mobirent</h1>
        <p>Hola ${user.username},</p>
        <p>Tu pago ha sido aprobado y tu reserva ha sido confirmada. Detalles:</p>
        <ul>
          <li><strong>Número de Reserva:</strong> ${reservation.reservationNumber}</li>
          <li><strong>Monto Pagado:</strong> ARS ${reservation.totalCost.toFixed(2)}</li>
          <li><strong>Transacción ID:</strong> ${paymentResult.transactionId}</li>
          <li><strong>Fecha de Reserva:</strong> ${reservation.createdAt.toLocaleString('es-AR')}</li>
        </ul>
        <p>¡Gracias por elegir Mobirent!</p>
      `;
      try {
        await sendEmail({
          email: user.email,
          subject: `Pago Aprobado - Reserva #${reservation.reservationNumber}`,
          html: voucherHtml,
        });
        reservation.voucherSent = true;
        await reservation.save();
      } catch (err) {
        console.error('Error al enviar voucher:', err);
        // No abortamos la respuesta, porque el pago sí fue aprobado.
      }
    }

    // d) Devolver respuesta exitosa
    res.status(200).json({
      message: 'Pago aprobado, reserva confirmada.',
      reservationId: reservation._id,
      reservationNumber: reservation.reservationNumber,
      totalCost: reservation.totalCost,
      paymentInfo: reservation.paymentInfo,
    });

    return;
  }

  // 7. Si retorna 'pending' (por simplicidad no lo usamos, pero lo cubrimos):
  res.status(400);
  throw new Error('Pago en proceso o pendiente. Intenta nuevamente más tarde.');
});

module.exports = {
  processReservationPayment,
};
