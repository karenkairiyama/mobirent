const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: { 
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Por favor, introduce un email válido']
    },
    password: {
      type: String,
      required: true,
    },
    dni: { // <-- NUEVO CAMPO PARA EL DNI
      type: String,
      required: true,
      unique: true, // ¡Importante! Asegura que el DNI sea único
      trim: true,
      match: [/^\d{7,9}$/, 'El DNI debe contener entre 7 y 9 dígitos numéricos.'] // Validación básica de formato DNI
    },
    dateOfBirth: { // <-- NUEVO CAMPO PARA FECHA DE NACIMIENTO
      type: Date, // Tipo Date para almacenar fechas
      required: true,
    },
    // --- Campos para la recuperación de contraseña ---
    resetPasswordToken: {
      type: String,
      default: null, // Por defecto no habrá token
    },
    resetPasswordExpires: {
      type: Date,
      default: null, // Por defecto no habrá fecha de expiración
    },
    // --- Fin de campos para recuperación de contraseña ---

    role: {
      // <-- NUEVO CAMPO PARA EL ROL
      type: String,
      enum: ['user', 'employee', 'admin'], // Roles permitidos
      default: 'user', // Rol por defecto al registrarse
    },
  },
  {
    timestamps: true, // Esto añade campos `createdAt` y `updatedAt` automáticamente
  }
);

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
