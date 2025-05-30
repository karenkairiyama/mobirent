// backend/models/Branch.js
const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Aseguramos que el nombre de la sucursal sea único
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    // Este array almacenará las referencias a los IDs de los vehículos
    vehicles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
    }],
}, {
    timestamps: true // Añade createdAt y updatedAt automáticamente
});

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;