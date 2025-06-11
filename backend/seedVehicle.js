// seedVehicle.js
require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');
const Branch  = require('./models/Branch');

async function seed() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✔ Conectado a MongoDB');

    // Tomamos cualquier sucursal existente para el campo `branch`
    const branch = await Branch.findOne();
    if (!branch) {
      throw new Error('No hay sucursales en la BD. Primero crea al menos una.');
    }

    // Crear un vehículo de prueba con todos los campos obligatorios
    const vehicle = await Vehicle.create({
      brand: 'TestBrand',
      model: 'TestModel',
      licensePlate: 'TEST-123',
      pricePerDay: 1000,
      branch: branch._id,            // campo requerido
      transmission: 'automatic',     // campo requerido: 'manual' | 'automatic'
      capacity: 5,                   // campo requerido: número de asientos
      type: 'sedan',                 // campo requerido: 'sedan' | 'suv' | etc.
      isAvailable: true,
      isReserved: false,
      needsMaintenance: false
    });

    console.log('🚗 Vehículo seed creado:', vehicle);
  } catch (err) {
    console.error('❌ Error al seedear vehículo:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seed();
