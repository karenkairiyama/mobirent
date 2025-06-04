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
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err.message));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/branches', branchRoutes); 
app.use('/api/admin', adminRoutes); // <-- NUEVO: Para la gestión de admin
app.use('/api/reservations', reservationRoutes); // <-- ESTO ES CLAVE


// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Mobirent corriendo...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});