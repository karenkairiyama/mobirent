// backend/controllers/reservationController.js

const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const Branch = require('../models/Branch');
const User = require('../models/User'); // Asegúrate de que esta línea esté presente.
const sendEmail = require('../utils/sendEmail'); // Necesitaremos esta utilidad.
const fakePaymentService = require('../services/fakePaymentService'); // Nuevo servicio.

// Helper para calcular el costo total (puedes ajustar la lógica)
const calculateTotalCost = (startDate, endDate, vehiclePricePerDay) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * vehiclePricePerDay
};

/**
 * @desc Create a new reservation and process payment
 * @route POST /api/reservations
 * @access Private (User)
 */
const createReservation = asyncHandler(async (req, res) => {
  // Regla 1: Requiere que el cliente haya iniciado sesión (Manejado por el middleware 'protect')
  const { vehicleId, pickupBranchId, returnBranchId, startDate, endDate, paymentData } = req.body;

  // 1. Validar campos obligatorios
  if (!vehicleId || !pickupBranchId || !returnBranchId || !startDate || !endDate || !paymentData) {
    res.status(400);
    throw new Error('Todos los campos de la reserva (vehículo, sucursales, fechas) y datos de pago son obligatorios.');
  }

  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Establecer a inicio del día para comparación

  // Regla 1: Selección de fechas válidas
  if (parsedStartDate < today) {
    res.status(400);
    throw new Error('La fecha de inicio de la reserva no puede ser anterior a hoy.');
  }
  if (parsedStartDate >= parsedEndDate) {
    res.status(400);
    throw new Error('La fecha de fin debe ser posterior a la fecha de inicio.');
  }

  // 2. Verificar existencia y estado del vehículo y sucursales
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehículo no encontrado.');
  }

  const pickupBranch = await Branch.findById(pickupBranchId);
  const returnBranch = await Branch.findById(returnBranchId);
  if (!pickupBranch || !returnBranch) {
    res.status(404);
    throw new Error('Una o ambas sucursales no encontradas.');
  }

  // Regla 2: Disponibilidad - no esté marcado En mantenimiento
  if (vehicle.status === 'En mantenimiento') { // Asumiendo un campo 'status' en el modelo Vehicle
    // Escenario 3: Vehículo ya no disponible
    res.status(400); // 400 Bad Request porque el cliente intentó reservar un vehículo no disponible
    throw new Error('Vehículo no disponible para reserva (en mantenimiento). Por favor, seleccione otro.');
  }

  // Regla 2: Disponibilidad - no esté ya reservado en el mismo período.
  // Buscar reservas existentes para este vehículo que se superpongan con el período solicitado
  const overlappingReservations = await Reservation.find({
    vehicle: vehicleId,
    status: { $in: ['pending', 'confirmed', 'picked_up'] }, // Considerar estados que bloquean la disponibilidad
    $or: [
      { startDate: { $lt: parsedEndDate, $gte: parsedStartDate } }, // inicio dentro del período solicitado
      { endDate: { $gt: parsedStartDate, $lte: parsedEndDate } },   // fin dentro del período solicitado
      { startDate: { $lte: parsedStartDate }, endDate: { $gte: parsedEndDate } } // período solicitado dentro de una reserva existente
    ]
  });

  if (overlappingReservations.length > 0) {
    // Escenario 3: Vehículo ya no disponible
    res.status(400);
    throw new Error('Vehículo no disponible en las fechas seleccionadas. Ya tiene una reserva superpuesta.');
  }

  // 3. Calcular el costo total (asumiendo que vehicle tiene dailyRentalRate)
  const totalCost = calculateTotalCost(parsedStartDate, parsedEndDate, vehicle.pricePerDay);
  if (totalCost <= 0) {
    res.status(400);
    throw new Error('El costo total de la reserva debe ser un valor positivo.');
  }

  // 4. Procesar el pago (simulado)
  const paymentResult = await fakePaymentService.processPayment(paymentData, totalCost);

  if (paymentResult.status === 'rejected') {
    // Escenario 4: Pago rechazado
    res.status(400); // 400 Bad Request por fallo en la lógica de negocio (pago)
    throw new Error('Pago no aprobado, intente nuevamente.');
  }

  // 5. Crear la reserva en la base de datos
  const reservation = await Reservation.create({
    user: req.user._id,
    vehicle: vehicleId,
    pickupBranch: pickupBranchId,
    returnBranch: returnBranchId,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
    totalCost: totalCost,
    status: 'confirmed', // Escenario 1a: Crea la reserva en estado Pagada (mapeado a 'confirmed')
    paymentInfo: {
      transactionId: paymentResult.transactionId,
      method: paymentData.method,
      status: paymentResult.status,
    },
  });

  // 6. Actualizar el estado del vehículo (Regla 2b): Marcar como no disponible para esas fechas.
  // (Nota: el campo 'status' en Vehicle es para mantenimiento. La disponibilidad en un rango de fechas
  // se maneja con la lógica de superposición de reservas que ya implementamos arriba.)
  // Si tu modelo Vehicle tiene un campo para "disponible" que se cambia por reserva, sería aquí.
  // Por ahora, la Regla 2b se satisface con la verificación de 'overlappingReservations'.

  // 7. Enviar voucher por email (Escenario 1c y 1d)
  const userEmail = req.user.email; // El email del usuario logueado
  const userName = req.user.name; // Asume que req.user.name está disponible del token o base de datos
  const voucherContent = `
    <h1>Confirmación de Reserva Mobirent</h1>
    <p>Hola ${userName},</p>
    <p>Tu reserva ha sido confirmada exitosamente. Aquí están los detalles:</p>
    <ul>
      <li><strong>Número de Reserva:</strong> ${reservation.reservationNumber}</li>
      <li><strong>Vehículo:</strong> ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})</li>
      <li><strong>Fechas:</strong> ${parsedStartDate.toLocaleDateString('es-AR')} - ${parsedEndDate.toLocaleDateString('es-AR')}</li>
      <li><strong>Sucursal de Retiro:</strong> ${pickupBranch.name} (${pickupBranch.address})</li>
      <li><strong>Sucursal de Devolución:</strong> ${returnBranch.name} (${returnBranch.address})</li>
      <li><strong>Costo Total:</strong> ARS ${reservation.totalCost.toFixed(2)}</li>
      <li><strong>Estado:</strong> ${reservation.status}</li>
    </ul>
    <p>Guarda este comprobante. Te esperamos para el retiro de tu vehículo.</p>
    <p>¡Gracias por elegir Mobirent!</p>
  `;

  try {
    await sendEmail({
      email: userEmail,
      subject: `Confirmación de Reserva Mobirent - #${reservation.reservationNumber}`,
      html: voucherContent,
    });
    // Marcar como voucher enviado en la reserva
    reservation.voucherSent = true;
    await reservation.save();

    // Enviar recordatorio automático (Escenario 1d)
    // Esto generalmente se haría con un scheduler (cron job) fuera del flujo de la petición,
    // pero para simularlo, puedes añadir una nota o una llamada a una función que "registre" el recordatorio.
    // Aquí solo simulamos que se "registró" el recordatorio.
    console.log(`[SIMULACIÓN] Recordatorio programado para la reserva ${reservation.reservationNumber} antes de la fecha de retiro.`);

  } catch (error) {
    console.error(`Error enviando voucher o programando recordatorio para ${userEmail}:`, error);
    // Podrías decidir qué hacer aquí: ¿fallar la reserva? ¿marcar un error en la reserva?
    // Por simplicidad, la reserva ya fue creada, solo se notifica del fallo de email.
    // Si el email es CRÍTICO para la confirmación, esto debería estar antes del res.status(201).
  }

  // Escenario 1c: Muestra mensaje “Reserva confirmada”
  res.status(201).json({
    message: 'Reserva confirmada exitosamente.',
    reservationId: reservation._id,
    reservationNumber: reservation.reservationNumber,
    totalCost: reservation.totalCost,
    status: reservation.status,
  });
});

const getMyReservations = asyncHandler(async (req, res) => {
  // Encuentra todas las reservas donde el 'user' sea el ID del usuario logueado.
  // El método .populate() se usa para reemplazar los ObjectIds de 'vehicle', 'pickupBranch',
  // y 'returnBranch' con los documentos reales de esos modelos, haciendo la respuesta más rica.
  console.log('Usuario autenticado (req.user):', req.user);
  console.log('ID del usuario (req.user._id):', req.user ? req.user._id : 'No user ID');
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('vehicle') // Popula todos los campos del vehículo
    .populate('pickupBranch') // Popula todos los campos de la sucursal de retiro
    .populate('returnBranch'); // Popula todos los campos de la sucursal de devolución

  res.status(200).json(reservations);
});


const getReservationById = asyncHandler(async (req, res) => {
  // Encuentra la reserva por su ID y popula la información relevante de otros modelos.
  console.log('ID de reserva recibido en req.params.id:', req.params.id); // <--- ¡AÑADE ESTA LÍNEA!

  const reservation = await Reservation.findById(req.params.id)
    .populate('user', 'username email') // Popula solo 'username' y 'email' del usuario
    .populate('vehicle', 'make model licensePlate dailyRentalRate') // Popula campos específicos del vehículo
    .populate('pickupBranch', 'name address') // Popula nombre y dirección de la sucursal de retiro
    .populate('returnBranch', 'name address'); // Popula nombre y dirección de la sucursal de devolución

  // Si la reserva no se encuentra
  if (!reservation) {
    res.status(404);
    throw new Error('Reserva no encontrada.');
  }

  // **Regla de Negocio Opcional:** Verificar que el usuario que intenta ver la reserva sea el dueño
  // o tenga un rol autorizado (ej. 'admin' o 'employee').
  // Descomenta y ajusta esto si necesitas esta validación estricta:
  // if (reservation.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'employee') {
  //   res.status(401);
  //   throw new Error('No autorizado para ver esta reserva.');
  // }

  res.status(200).json(reservation);
});

// ¡¡¡ASEGÚRATE DE QUE ESTA PARTE ESTÉ AL FINAL DEL ARCHIVO Y EXPORTE TODO!!!
module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  // Si tienes otras funciones en este controlador, asegúrate de exportarlas también aquí.
};