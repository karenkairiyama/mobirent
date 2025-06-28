// backend/controllers/reservationController.js

const asyncHandler = require("express-async-handler");
const Reservation = require("../models/Reservation");
const Vehicle = require("../models/Vehicle");
const Branch = require("../models/Branch");
const User = require("../models/User"); // Asegúrate de que User está importado para el email
const sendEmail = require("../utils/sendEmail");
const fakePaymentService = require("../services/fakePaymentService");
const { calculateRefund } = require("../services/refundService"); // Importar el servicio de reembolso

// Helper para calcular el costo total (mantener si se usa en createReservation)
const calculateTotalCost = (startDate, endDate, vehiclePricePerDay) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * vehiclePricePerDay;
};

/**
 * @desc    Crear una nueva reserva en ESTADO PENDING (sin procesar pago)
 * @route   POST /api/reservations
 * @access Private (User)
 * NOTA: Esta función podría ser modificada en el futuro si se decide que las reservas
 * solo existen si están confirmadas, como se discutió anteriormente.
 */
const createReservation = asyncHandler(async (req, res) => {
  const { vehicleId, pickupBranchId, returnBranchId, startDate, endDate } =
    req.body;

  // 1) Validar campos obligatorios
  if (
    !vehicleId ||
    !pickupBranchId ||
    !returnBranchId ||
    !startDate ||
    !endDate
  ) {
    res.status(400);
    throw new Error(
      "Faltan datos obligatorios: vehículo, sucursales y fechas."
    );
  }

  // Normalizar fechas a inicio del día en UTC para comparaciones precisas
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  // Obtener el día de hoy en UTC
  const todayUTC = new Date(
    Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    )
  );

  // Obtener la fecha de inicio de la reserva en UTC
  const startDateUTC = new Date(
    Date.UTC(
      parsedStartDate.getFullYear(),
      parsedStartDate.getMonth(),
      parsedStartDate.getDate()
    )
  );

  // Comparar las fechas normalizadas en UTC
  if (startDateUTC < todayUTC) {
    res.status(400);
    throw new Error("La fecha de inicio no puede ser anterior a hoy.");
  }
  if (parsedStartDate >= parsedEndDate) {
    res.status(400);
    throw new Error("La fecha de fin debe ser posterior a la fecha de inicio.");
  }

  // 2) Verificar existencia y estado de vehículo y sucursales
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404);
    throw new Error("Vehículo no encontrado.");
  }

  const pickupBranch = await Branch.findById(pickupBranchId);
  const returnBranch = await Branch.findById(returnBranchId);
  if (!pickupBranch || !returnBranch) {
    res.status(404);
    throw new Error("Sucursal de retiro o devolución no encontrada.");
  }

  // 3) Verificar disponibilidad del vehículo
  if (vehicle.needsMaintenance) {
    res.status(400);
    throw new Error("Vehículo en mantenimiento. Elige otro.");
  }
  // Si isAvailable o isReserved son flags en el modelo
  if (!vehicle.isAvailable || vehicle.isReserved) {
    res.status(400);
    throw new Error("Vehículo no disponible o ya reservado.");
  }

  // 4) Revisar reservas superpuestas
  const overlappingReservations = await Reservation.find({
    vehicle: vehicleId,
    status: { $in: ["pending", "confirmed", "picked_up"] }, // Aquí se siguen considerando 'pending'
    $or: [
      { startDate: { $lt: parsedEndDate, $gte: parsedStartDate } },
      { endDate: { $gt: parsedStartDate, $lte: parsedEndDate } },
      {
        startDate: { $lte: parsedStartDate },
        endDate: { $gte: parsedEndDate },
      },
    ],
  });
  if (overlappingReservations.length > 0) {
    res.status(400);
    throw new Error(
      "Ya existe una reserva superpuesta para ese vehículo y fechas."
    );
  }

  // 5) Calcular costo total
  const totalCost = calculateTotalCost(
    parsedStartDate,
    parsedEndDate,
    vehicle.pricePerDay
  );
  if (totalCost <= 0) {
    res.status(400);
    throw new Error("El costo total debe ser positivo.");
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
    status: "pending",
    paymentInfo: {
      transactionId: null,
      method: null,
      status: null,
    },
    reservationNumber: null, // el hook pre('save') lo genera automáticamente
  });

  res.status(201).json({
    message: "Reserva creada en estado pendiente. Ahora debes pagar.",
    reservationId: newReservation._id,
    reservationNumber: newReservation.reservationNumber,
    totalCost: newReservation.totalCost,
    status: newReservation.status,
  });
});

/**
 * @desc    Obtener todas las reservas del usuario
 * @route   GET /api/reservations/myreservations
 * @access  Private (User)
 */
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate("vehicle")
    .populate("pickupBranch")
    .populate("returnBranch");
  res.status(200).json(reservations);
});

/**
 * @desc    Obtener detalle de una reserva
 * @route   GET /api/reservations/:id
 * @access  Private (User)
 */
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate("user", "username email")
    .populate("vehicle", "brand model licensePlate pricePerDay")
    .populate("pickupBranch", "name address")
    .populate("returnBranch", "name address");

  if (!reservation) {
    res.status(404);
    throw new Error("Reserva no encontrada.");
  }
  res.status(200).json(reservation);
});

/**
 * @desc    Procesar pago de una reserva existente
 * @route   POST /api/reservations/:id/pay
 * @access  Private (usuario dueño de la reserva)
 */
const payReservation = asyncHandler(async (req, res) => {
  console.log("****** DEBUG: INICIANDO payReservation CONTROLLER ******");
  console.log("****** DEBUG: Request Params ID:", req.params.id);
  console.log("****** DEBUG: Request Body:", req.body);
  console.log("****** DEBUG: User ID:", req.user._id);
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
      "Faltan datos de la tarjeta: cardNumber, expiry, cvv y method son obligatorios."
    );
  }

  // 2) Buscar la reserva
  const reservation = await Reservation.findById(reservationId)
    .populate("vehicle")
    .populate("pickupBranch")
    .populate("returnBranch")
    .populate("user");
  if (!reservation) {
    res.status(404);
    throw new Error("Reserva no encontrada.");
  }

  console.log(
    "[PAY] Antes de pagar, estado en BD:",
    reservation.status,
    " createdAt:",
    reservation.createdAt
  );

  // 3) Verificar que el usuario propietario sea el que paga
  if (reservation.user._id.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("No autorizado para pagar esta reserva.");
  }

  // 4) Solo permitir pago si está “pending” y dentro de los primeros 30 minutos
  if (reservation.status !== "pending") {
    res.status(400);
    throw new Error("Esta reserva ya no está pendiente de pago.");
  }
  const now = new Date();
  const createdAt = new Date(reservation.createdAt);
  if (now - createdAt > 30 * 60 * 1000) {
    // si pasaron más de 30 minutos, cancelar la reserva y liberar vehículo
    reservation.status = "cancelled";
    // CAMBIO: Asegúrate de que paymentInfo.status también refleje el rechazo por tiempo
    reservation.paymentInfo.status = "rejected";
    await reservation.save();
    res.status(400); // Re-setear status para el throw
    throw new Error(
      "Se venció el plazo de pago (30 min). La reserva ha sido cancelada."
    );
  }

  // 5) Procesar el pago simulado
  const monto = reservation.totalCost;
  const resultado = await fakePaymentService.processPayment(paymentData, monto);

  if (resultado.status === "rejected") {
    // 6b) Pago rechazado: la reserva sigue “pending” y guardamos el intento
    reservation.paymentInfo = {
      transactionId: resultado.transactionId,
      method: paymentData.method,
      status: "rejected",
    };
    await reservation.save();

    return res.status(400).json({
      message: "Pago rechazado, intenta con otra tarjeta.",
      status: "rejected",
    });
  }

  if (resultado.status === "pending") {
    // 6c) Pago en proceso (estado intermedio)
    reservation.paymentInfo = {
      transactionId: resultado.transactionId,
      method: paymentData.method,
      status: "pending",
    };
    await reservation.save();

    return res.status(200).json({
      message: "Pago en proceso. Te notificaremos cuando se confirme.",
      status: "pending",
    });
  }

  // 6a) Si status === 'approved'
  reservation.status = "confirmed";
  console.log("[PAY] Branch aprobado: marcando status = confirmed");
  reservation.paymentInfo = {
    transactionId: resultado.transactionId,
    method: paymentData.method,
    status: "approved",
  };
  reservation.voucherSent = true; // ¡Asegúrate de marcar esto!
  await reservation.save();

  // 7) Marcar vehículo como reservado
  const vehiculo = await Vehicle.findById(reservation.vehicle._id);
  if (vehiculo) {
    vehiculo.isReserved = true;
    // Si el vehículo estaba en mantenimiento y sale de allí al ser reservado (no es el flujo normal, pero por si acaso)
    // vehiculo.needsMaintenance = false;
    // vehiculo.maintenanceReason = null;
    // vehiculo.maintenanceStartDate = null;
    vehiculo.isAvailable = false; // Un vehículo reservado no está disponible para otros
    await vehiculo.save();
    console.log("[PAY] Después de save(), estado en BD:", reservation.status);
  }

  // 8) Enviar voucher por correo
  try {
    const userEmail = reservation.user.email;
    const userName =
      reservation.user.username || reservation.user.email.split("@")[0]; // Usa el username o la parte antes del @
    const vehicleDetails = reservation.vehicle
      ? `${reservation.vehicle.brand} ${reservation.vehicle.model} (${reservation.vehicle.licensePlate})`
      : "N/A";
    const pickupBranchName = reservation.pickupBranch
      ? `${reservation.pickupBranch.name} (${reservation.pickupBranch.address})`
      : "N/A";
    const returnBranchName = reservation.returnBranch
      ? `${reservation.returnBranch.name} (${reservation.returnBranch.address})`
      : "N/A";

    // Formateo de fechas para el email
    const startDateFormatted = new Date(
      reservation.startDate
    ).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const endDateFormatted = new Date(reservation.endDate).toLocaleDateString(
      "es-AR",
      { year: "numeric", month: "long", day: "numeric" }
    );

    const voucherHtml = `
            <h1>¡Tu Reserva en Mobirent ha sido Confirmada!</h1>
            <p>Estimado(a) <strong>${userName}</strong>,</p>
            <p>Nos complace informarte que tu pago ha sido procesado con éxito y tu reserva ha sido confirmada.</p>
            <p><strong>Detalles de tu Reserva:</strong></p>
            <ul>
                <li><strong>Número de Reserva:</strong> ${
                  reservation.reservationNumber
                }</li>
                <li><strong>Vehículo:</strong> ${vehicleDetails}</li>
                <li><strong>Fechas de Retiro:</strong> ${startDateFormatted}</li>
                <li><strong>Fechas de Devolución:</strong> ${endDateFormatted}</li>
                <li><strong>Sucursal de Retiro:</strong> ${pickupBranchName}</li>
                <li><strong>Sucursal de Devolución:</strong> ${returnBranchName}</li>
                <li><strong>Costo Total Pagado:</strong> ARS ${reservation.totalCost.toFixed(
                  2
                )}</li>
                <li><strong>Estado:</strong> ${reservation.status.toUpperCase()}</li>
            </ul>
            <p>Puedes ver los detalles de tu reserva en cualquier momento iniciando sesión en tu cuenta de Mobirent.</p>
            <p>¡Gracias por elegir Mobirent! ¡Que disfrutes tu viaje!</p>
            <p>Atentamente, <br/>El equipo de Mobirent</p>
        `;

    console.log(
      `DEBUG: Intentando enviar voucher a ${userEmail} para reserva ${reservation.reservationNumber}`
    );
    console.log(
      `DEBUG: Asunto del email: Voucher de Confirmación de Reserva - ${reservation.reservationNumber}`
    );

    await sendEmail(
      reservation.user.email,
      `Voucher de Confirmación de Reserva - ${reservation.reservationNumber}`,
      voucherHtml
    );

    console.log(`DEBUG: La función sendEmail terminó de ejecutarse sin error.`);
  } catch (mailErr) {
    console.error(
      "ERROR CRÍTICO: Fallo en el envío de voucher (catch block):",
      mailErr
    );
  }

  return res.status(200).json({
    message: "Pago aprobado y reserva confirmada.",
    status: "approved",
  });
});

/**
 * @desc    Cancelar una reserva y calcular/processar reembolso
 * @route   PUT /api/reservations/:id/cancel
 * @access  Private (usuario dueño de la reserva)
 */
const cancelReservation = asyncHandler(async (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user._id;

  // 1) Buscar la reserva y poblarla con vehicle y user
  const reservation = await Reservation.findById(reservationId)
    .populate("vehicle") // Necesitamos detalles del vehículo para liberarlo si es necesario
    .populate("user", "username email"); // Necesitamos el email del usuario para el correo

  if (!reservation) {
    res.status(404);
    throw new Error("Reserva no encontrada.");
  }

  // 2) Verificar que el usuario propietario sea el que cancela
  if (reservation.user._id.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("No autorizado para cancelar esta reserva.");
  }

  // 3) Verificar estado permitido (solo "confirmed")
  // Consideramos que 'picked_up' o 'returned' no se pueden cancelar con reembolso.
  if (reservation.status !== "confirmed") {
    res.status(400);
    throw new Error(
      `La reserva no puede ser cancelada en estado "${reservation.status}".`
    );
  }

  // 4) Calcular reembolso
  const refundAmount = calculateRefund(
    reservation.startDate,
    reservation.totalCost
  );

  // 5) Actualizar campos de cancelación
  reservation.status = "cancelled";
  reservation.canceledAt = new Date(); // Asigna la fecha y hora actual de la cancelación
  reservation.refundAmount = refundAmount;
  await reservation.save();

  // 6) Liberar disponibilidad del vehículo
  // Solo si el vehículo estaba marcado como reservado (lo cual ocurre al CONFIRMAR la reserva)
  const vehicle = await Vehicle.findById(reservation.vehicle._id);
  if (vehicle && vehicle.isReserved) {
    // Si el vehículo fue populado y estaba marcado como reservado
    vehicle.isReserved = false;
    // Opcional: Si el vehículo se marcó como no disponible al reservar, volver a disponible.
    // Asume que al liberar la reserva, el vehículo vuelve a ser "disponible" a menos que esté en mantenimiento.
    if (!vehicle.needsMaintenance) {
      // Solo si no está en mantenimiento
      vehicle.isAvailable = true;
    }
    await vehicle.save();
  }

  // 7) Enviar email de confirmación de cancelación con detalles y monto de reembolso
  const refundType =
    refundAmount === reservation.totalCost
      ? "Total (100%)"
      : refundAmount > 0 && refundAmount < reservation.totalCost
      ? "Parcial (80% del costo total)"
      : "Sin reembolso";

  const vehicleDetailsEmail = reservation.vehicle
    ? `${reservation.vehicle.brand} ${reservation.vehicle.model} (${reservation.vehicle.licensePlate})`
    : "N/A";
  const pickupBranchNameEmail = reservation.pickupBranch
    ? `${reservation.pickupBranch.name}`
    : "N/A";
  const returnBranchNameEmail = reservation.returnBranch
    ? `${reservation.returnBranch.name}`
    : "N/A";
  const startDateFormattedEmail = new Date(
    reservation.startDate
  ).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const endDateFormattedEmail = new Date(
    reservation.endDate
  ).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userName =
    reservation.user.username || reservation.user.email.split("@")[0];

  const correoHtml = `
        <h1>Confirmación de Cancelación de Reserva - Mobirent</h1>
        <p>Estimado(a) <strong>${userName}</strong>,</p>
        <p>Te confirmamos que tu reserva <strong>#${
          reservation.reservationNumber
        }</strong> para el vehículo ${vehicleDetailsEmail} ha sido cancelada exitosamente.</p>
        <p><strong>Detalles de la Reserva Cancelada:</strong></p>
        <ul>
            <li><strong>Número de Reserva:</strong> ${
              reservation.reservationNumber
            }</li>
            <li><strong>Vehículo:</strong> ${vehicleDetailsEmail}</li>
            <li><strong>Fechas de Retiro:</strong> ${startDateFormattedEmail}</li>
            <li><strong>Fechas de Devolución:</strong> ${endDateFormattedEmail}</li>
            <li><strong>Sucursal de Retiro:</strong> ${pickupBranchNameEmail}</li>
            <li><strong>Sucursal de Devolución:</strong> ${returnBranchNameEmail}</li>
            <li><strong>Costo Total de la Reserva:</strong> ARS ${reservation.totalCost.toFixed(
              2
            )}</li>
            <li><strong>Estado de la Reserva:</strong> CANCELADA</li>
        </ul>
        <p><strong>Detalle del Reembolso:</strong></p>
        <ul>
            <li><strong>Monto a Reembolsar:</strong> ARS ${refundAmount.toFixed(
              2
            )}</li>
            <li><strong>Tipo de Reembolso:</strong> ${refundType}</li>
        </ul>
        <p>El reembolso se procesará según nuestra política de cancelaciones.</p>
        <p>Lamentamos que no puedas continuar con tu reserva. Esperamos verte pronto.</p>
        <p>Atentamente, <br/>El equipo de Mobirent</p>
    `;

  try {
    await sendEmail(
      reservation.user.email, // Destinatario
      `Confirmación de Cancelación - Reserva #${reservation.reservationNumber}`, // Asunto
      correoHtml // Contenido HTML
    );
    console.log(
      `Email de cancelación con reembolso enviado a ${reservation.user.email} para reserva ${reservation.reservationNumber}`
    );
  } catch (mailErr) {
    console.error("Error al enviar email de cancelación:", mailErr);
  }

  // 8) Respuesta al frontend
  res.status(200).json({
    message: "Reserva cancelada con éxito.",
    refundAmount: refundAmount, // <-- INCLUIR EN LA RESPUESTA
    refundType: refundType, // <-- INCLUIR EN LA RESPUESTA
    reservationId: reservation._id,
    status: "cancelled",
  });
});

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  payReservation,
  cancelReservation,
};
