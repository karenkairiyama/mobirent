// backend/models/Reservation.js

const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referencia al modelo de usuario
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle', // Referencia al modelo de vehículo
    },
    pickupBranch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Branch', // Referencia a la sucursal de recogida
    },
    returnBranch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Branch', // Referencia a la sucursal de devolución
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0, // El costo no puede ser negativo
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'picked_up', 'returned'], // Estados posibles
      default: 'pending', // Una reserva inicia como 'pending' antes de ser confirmada por pago
    },
    reservationNumber: {
      type: String,
      unique: true,
      // Se generará en el pre-save hook o al momento de la creación en el controlador si es necesario.
      // Puedes hacerlo opcional si prefieres generarlo en el controlador para más control
    },
    paymentInfo: { // Información opcional del pago si se guarda (ej. ID de transacción, método)
      transactionId: { type: String },
      method: { type: String },
      status: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
    },
    // Podrías añadir un campo para saber si el voucher fue enviado
    voucherSent: {
      type: Boolean,
      default: false,
    },

    // CAMPOS PARA ADICIONALES (NUEVOS)
    adicionales: [ // Un array de objetos que describen los adicionales
      {
        adicional: { // ID del adicional (referencia al modelo Adicional)
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Adicional',
          // No es 'required' aquí, ya que el array puede estar vacío si no se eligen adicionales
        },
        quantity: { // Cantidad de este adicional (ej. 2 sillas de bebé)
          type: Number,
          default: 1, // Por defecto 1, pero se puede especificar
          min: 1,
        },
        itemPrice: { // Precio del adicional en el momento de la adición (para historial si el precio cambia después)
          type: Number,
          min: 0,
          // Será requerido en la lógica del controlador cuando se añada un adicional
        },
      },
    ],

    // CAMPOS PARA CANCELACIÓN
    canceledAt: {
      type: Date,
      default: null,     // null hasta que se cancele
    },
    refundAmount: {
      type: Number,
      default: 0,        // 0 hasta que calculemos el reembolso
      min: 0,
    },
  },
  {
    timestamps: true, // Esto añade createdAt y updatedAt automáticamente
  }
);

// Hook para generar el número de reserva antes de guardar si no existe
reservationSchema.pre('save', async function (next) {
  if (this.isNew && !this.reservationNumber) {
    // Generación simple: RES + timestamp + 3 dígitos aleatorios
    this.reservationNumber = `RES-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;