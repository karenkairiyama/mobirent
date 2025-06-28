const mongoose = require('mongoose');

const adicionalSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del adicional es obligatorio'],
      unique: true, // Para asegurar que no haya duplicados de nombres de adicionales
      trim: true, // Para eliminar espacios en blanco al inicio/final
    },
    price: {
      type: Number,
      required: [true, 'El precio del adicional es obligatorio'],
      min: [0, 'El precio no puede ser negativo'], // El precio debe ser 0 o más
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Esto añade createdAt y updatedAt automáticamente
  }
);

const Adicional = mongoose.model('Adicional', adicionalSchema);

module.exports = Adicional;