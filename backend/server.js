require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Importa tus rutas de autenticación
const vehicleRoutes = require('./routes/vehicleRoutes'); // Importa las rutas de vehículos

const app = express();

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err.message));

// Rutas de la API
app.use('/api/auth', authRoutes); // Todas las rutas en auth.js tendrán el prefijo /api/auth
app.use('/api/vehicles', vehicleRoutes); // Para la gestión de vehículos

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Mobirent corriendo...');
});

const PORT = process.env.PORT || 5000; // Usa el puerto definido en .env o 5000 por defecto

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});