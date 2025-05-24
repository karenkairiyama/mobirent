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
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
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
