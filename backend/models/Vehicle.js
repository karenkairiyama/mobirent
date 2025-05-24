// backend/models/Vehicle.js
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); // Importa mongoose-sequence

const vehicleSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    model: {
        type: String,
        required: true,
        trim: true,
    },
    pricePerDay: {
        type: Number,
        required: true,
        min: 0,
    },
    // Eliminamos 'vehicleId' de aquí, será generado por el plugin
    isAvailable: {
        type: Boolean,
        default: true,
    },
    photoUrl: {
        type: String,
        required: false,
        trim: true,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true
});

// Aplica el plugin AutoIncrement al esquema
// Esto creará un campo '_id' autoincrementado por defecto
// y también creará una colección '__sequences' para manejar los contadores.
vehicleSchema.plugin(AutoIncrement, { inc_field: 'vehicleId', start_seq: 1000 }); // Puedes cambiar 'start_seq' si quieres que empiece en otro número

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;