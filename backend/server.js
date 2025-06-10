// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicleRoutes');
const adminRoutes = require('./routes/adminRoutes'); // <-- NUEVO: Importa las rutas de admin
const branchRoutes = require('./routes/branchRoutes'); // Añade esta línea
const reservationRoutes = require('./routes/reservationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const app = express();

app.use(cors());
app.use(express.json());
console.log('--- MOBIRENT BACKEND INICIADO Y LEYENDO CÓDIGO ---'); // <-- ¡NUEVO LOG DE PRUEBA!
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err.message));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/branches', branchRoutes); 
app.use('/api/admin', adminRoutes); // <-- NUEVO: Para la gestión de admin
app.use('/api/reservations', reservationRoutes); // <-- ESTO ES CLAVE
app.use('/api/payments', paymentRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Mobirent corriendo...');
});
// --- INICIO: MIDDLEWARE DE MANEJO DE ERRORES ---
// Este middleware DEBE ir después de todas las rutas,
// ya que será el último en atrapar cualquier error que ocurra en las rutas anteriores.
app.use((err, req, res, next) => {
    // Si la respuesta ya tiene un código de estado (por ejemplo, 400, 401, 404, etc.), lo usa.
    // Si no, asume un error 500 (Error Interno del Servidor).
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Envía la respuesta en formato JSON
    res.json({
        message: err.message,
        // En desarrollo, puedes incluir el stack trace para depuración.
        // En producción, es mejor NO enviarlo por seguridad.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});
// --- FIN: MIDDLEWARE DE MANEJO DE ERRORES ---

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});