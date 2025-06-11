// backend/controllers/reservationController.js

const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const Branch = require('../models/Branch');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const fakePaymentService = require('../services/fakePaymentService');
const { calculateRefund } = require('../services/refundService');

// Helper para calcular el costo total
const calculateTotalCost = (startDate, endDate, vehiclePricePerDay) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * vehiclePricePerDay;
};

/**
 * @desc   Crear una nueva reserva en ESTADO PENDING (sin procesar pago)
 * @route  POST /api/reservations
 * @access Private (User)
 */
const createReservation = asyncHandler(async (req, res) => {
  const { vehicleId, pickupBranchId, returnBranchId, startDate, endDate } = req.body;

  // 1) Validar campos obligatorios
  if (!vehicleId || !pickupBranchId || !returnBranchId || !startDate || !endDate) {
    res.status(400);
    throw new Error('Faltan datos obligatorios: vehículo, sucursales y fechas.');
  }

  const parsedStartDate = new Date(startDate);
  parsedStartDate.setHours(0, 0, 0, 0);
  const parsedEndDate = new Date(endDate);
  parsedEndDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsedStartDate < today) {
    res.status(400);
    throw new Error('La fecha de inicio no puede ser anterior a hoy.');
  }
  if (parsedStartDate >= parsedEndDate) {
    res.status(400);
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio.');
  }

  // 2) Verificar existencia y estado de vehículo y sucursales
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehículo no encontrado.');
  }

  const pickupBranch = await Branch.findById(pickupBranchId);
  const returnBranch = await Branch.findById(returnBranchId);
  if (!pickupBranch || !returnBranch) {
    res.status(404);
    throw new Error('Sucursal de retiro o devolución no encontrada.');
  }

  // 3) Verificar disponibilidad del vehículo
  if (vehicle.needsMaintenance) {
    res.status(400);
    throw new Error('Vehículo en mantenimiento. Elige otro.');
  }
  if (!vehicle.isAvailable || vehicle.isReserved) {
    res.status(400);
    throw new Error('Vehículo no disponible o ya reservado.');
  }

  // 4) Revisar reservas superpuestas
  const overlappingReservations = await Reservation.find({
    vehicle: vehicleId,
    status: { $in: ['pending', 'confirmed', 'picked_up'] },
    $or: [
      { startDate: { $lt: parsedEndDate, $gte: parsedStartDate } },
      { endDate: { $gt: parsedStartDate, $lte: parsedEndDate } },
      { startDate: { $lte: parsedStartDate }, endDate: { $gte: parsedEndDate } }
    ]
  });
  if (overlappingReservations.length > 0) {
    res.status(400);
    throw new Error('Ya existe una reserva superpuesta para ese vehículo y fechas.');
  }

  // 5) Calcular costo total
  const totalCost = calculateTotalCost(parsedStartDate, parsedEndDate, vehicle.pricePerDay);
  if (totalCost <= 0) {
    res.status(400);
    throw new Error('El costo total debe ser positivo.');
  }

  // 6) Crear la reserva en estado "pending"
  const newReservation = await Reservation.create({
    user: req.user._id,
    vehicle: vehicleId,
    pickupBranch: pickupBranchId,
    returnBranch: returnBranchId,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    totalCost,
    status: 'pending',
    paymentInfo: {
      transactionId: null,
      method: null,
      status: null
    },
    reservationNumber: null // el hook pre('save') lo genera automáticamente
  });

  // 7) No bloqueamos el vehículo hasta que se pague
  res.status(201).json({
    message: 'Reserva creada en estado pendiente. Ahora debes pagar.',
    reservationId: newReservation._id,
    reservationNumber: newReservation.reservationNumber,
    totalCost: newReservation.totalCost,
    status: newReservation.status
  });
});

/**
 * @desc    Obtener todas las reservas del usuario
 * @route   GET /api/reservations/myreservations
 * @access  Private (User)
 */
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('vehicle')
    .populate('pickupBranch')
    .populate('returnBranch');
  res.status(200).json(reservations);
});

/**
 * @desc    Obtener detalle de una reserva
 * @route   GET /api/reservations/:id
 * @access  Private (User)
 */
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('user', 'username email')
    .populate('vehicle', 'brand model licensePlate pricePerDay')
    .populate('pickupBranch', 'name address')
    .populate('returnBranch', 'name address');

  if (!reservation) {
    res.status(404);
    throw new Error('Reserva no encontrada.');
  }
  res.status(200).json(reservation);
});

/**
 * @desc    Procesar pago de una reserva existente
 * @route   POST /api/reservations/:id/pay
 * @access  Private (usuario dueño de la reserva)
 */
const payReservation = asyncHandler(async (req, res) => {
  const reservationId = req.params.id;
  const { paymentData } = req.body;
  const userId = req.user._id;

  // 1) Validar que vengan todos los campos dentro de paymentData
  if (
    !paymentData ||
    !paymentData.cardNumber ||
    !paymentData.expiry ||
    !paymentData.cvv ||
    !paymentData.method
  ) {
    res.status(400);
    throw new Error(
      'Faltan datos de la tarjeta: cardNumber, expiry, cvv y method son obligatorios.'
    );
  }

  // 2) Buscar la reserva
  const reservation = await Reservation.findById(reservationId)
    .populate('vehicle')
    .populate('pickupBranch')
    .populate('returnBranch')
    .populate('user');
  if (!reservation) {
    res.status(404);
    throw new Error('Reserva no encontrada.');
  }

  console.log('[PAY] Antes de pagar, estado en BD:', reservation.status, ' createdAt:', reservation.createdAt);


  // 3) Verificar que el usuario propietario sea el que paga
  if (reservation.user._id.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('No autorizado para pagar esta reserva.');
  }

  // 4) Solo permitir pago si está “pending” y dentro de los primeros 30 minutos
  if (reservation.status !== 'pending') {
    res.status(400);
    throw new Error('Esta reserva ya no está pendiente de pago.');
  }
  const now = new Date();
  const createdAt = new Date(reservation.createdAt);
  if (now - createdAt > 30 * 60 * 1000) {
    // si pasaron más de 30 minutos, cancelar la reserva y liberar vehículo
    reservation.status = 'cancelled';
    await reservation.save();
    res.status(400);
    throw new Error(
      'Se venció el plazo de pago (30 min). La reserva ha sido cancelada.'
    );
  }

  // 5) Procesar el pago simulado
  const monto = reservation.totalCost;
  const resultado = await fakePaymentService.processPayment(paymentData, monto);

  if (resultado.status === 'rejected') {
    // 6b) Pago rechazado: la reserva sigue “pending” y guardamos el intento
    reservation.paymentInfo = {
      transactionId: resultado.transactionId,
      method: paymentData.method,
      status: 'rejected'
    };
    await reservation.save();

    return res.status(400).json({
      message: 'Pago rechazado, intenta con otra tarjeta.',
      status: 'rejected'
    });
  }

  if (resultado.status === 'pending') {
    // 6c) Pago en proceso (estado intermedio)
    reservation.paymentInfo = {
      transactionId: resultado.transactionId,
      method: paymentData.method,
      status: 'pending'
    };
    await reservation.save();

    return res.status(200).json({
      message: 'Pago en proceso. Te notificaremos cuando se confirme.',
      status: 'pending'
    });
  }

  // 6a) Si status === 'approved'
  reservation.status = 'confirmed';
  console.log('[PAY] Branch aprobado: marcando status = confirmed');
  reservation.paymentInfo = {
    transactionId: resultado.transactionId,
    method: paymentData.method,
    status: 'approved'
  };
  await reservation.save();


  // 7) Marcar vehículo como reservado
  const vehiculo = await Vehicle.findById(reservation.vehicle._id);
  if (vehiculo) {
    vehiculo.isReserved = true;
    await vehiculo.save();
    console.log('[PAY] Después de save(), estado en BD:', reservation.status);
  }

  // 8) Enviar voucher por correo
  try {
    const correoHtml = `
      <h1>Pago Aprobado - Mobirent</h1>
      <p>Tu pago ha sido procesado exitosamente. Aquí tu comprobante:</p>
      <ul>
        <li><strong>Reserva:</strong> ${reservation.reservationNumber}</li>
        <li><strong>Total:</strong> ARS ${reservation.totalCost.toFixed(2)}</li>
        <li><strong>Transacción:</strong> ${resultado.transactionId}</li>
        <li><strong>Estado:</strong> Aprobado</li>
      </ul>
      <p>Gracias por confiar en Mobirent.</p>
    `;
    await sendEmail({
      email: reservation.user.email,
      subject: `Pago Confirmado - Reserva #${reservation.reservationNumber}`,
      html: correoHtml
    });
    reservation.voucherSent = true;
    await reservation.save();
  } catch (mailErr) {
    console.error('Error al enviar voucher:', mailErr);
  }

  return res.status(200).json({
    message: 'Pago aprobado y reserva confirmada.',
    status: 'approved'
  });
});

/**
 * @desc    Cancelar una reserva y calcular/processar reembolso
 * @route   DELETE /api/reservations/:id
 * @access  Private (usuario dueño de la reserva)
 */
const cancelReservation = asyncHandler(async (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user._id;

  // 1) Buscar la reserva y poblarla con vehicle y user
  const reservation = await Reservation.findById(reservationId)
    .populate('vehicle')
    .populate('user');

  if (!reservation) {
    res.status(404);
    throw new Error('Reserva no encontrada.');
  }

  // 2) Verificar que el usuario propietario sea el que cancela
  if (reservation.user._id.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('No autorizado para cancelar esta reserva.');
  }

  // 3) Verificar estado permitido (solo "confirmed")
  if (reservation.status !== 'confirmed') {
    res.status(400);
    throw new Error('Solo se pueden cancelar reservas confirmadas.');
  }

  // 4) Calcular reembolso
  const refundAmount = calculateRefund(reservation.startDate, reservation.totalCost);

  // 5) Actualizar campos de cancelación
  reservation.status = 'cancelled';
  reservation.canceledAt = new Date();
  reservation.refundAmount = refundAmount;
  await reservation.save();

  /* 6) Liberar disponibilidad del vehículo
  const veh = await Vehicle.findById(reservation.vehicle._id);
  if (veh) {
    veh.isReserved = false;
    await veh.save();
  }*/

  // 7) Enviar email de confirmación de cancelación
  const refundType =
    refundAmount === reservation.totalCost ? 'Total' :
    refundAmount > 0 ? 'Parcial (20%)' : 'Sin reembolso';

  const correoHtml = `
    <h1>Cancelación de Reserva - Mobirent</h1>
    <p>Tu reserva <strong>#${reservation.reservationNumber}</strong> ha sido cancelada.</p>
    <p><strong>Monto de reembolso:</strong> ARS ${refundAmount.toFixed(2)}</p>
    <p><strong>Tipo de reembolso:</strong> ${refundType}</p>
  `;

  try {
    await sendEmail({
      email: reservation.user.email,
      subject: `Reserva Cancelada - #${reservation.reservationNumber}`,
      html: correoHtml
    });
  } catch (mailErr) {
    console.error('Error al enviar email de cancelación:', mailErr);
  }

  // 8) Respuesta
  res.status(200).json({
    message: 'Reserva cancelada con éxito.',
    refundAmount,
    refundType
  });
});

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  payReservation,
  cancelReservation
};
