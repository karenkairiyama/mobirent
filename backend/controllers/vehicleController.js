// backend/controllers/vehicleController.js

const Vehicle = require('../models/Vehicle');
// Ya no necesitamos 'uuid' si mongoose-sequence genera el ID

// @desc    Crear un nuevo vehículo (solo para admin)
// @route   POST /api/vehicles
// @access  Admin
const createVehicle = async (req, res) => {
    const { brand, model, pricePerDay, photoUrl, isAvailable } = req.body;

    // Validaciones básicas
    if (!brand || !model || !pricePerDay) {
        return res.status(400).json({ message: 'Por favor, introduce la marca, el modelo y el precio por día del vehículo.' });
    }
    if (isNaN(pricePerDay) || parseFloat(pricePerDay) < 0) { // Usar parseFloat para manejar números decimales
        return res.status(400).json({ message: 'El precio por día debe ser un número positivo.' });
    }

    try {
        const vehicle = await Vehicle.create({
            brand,
            model,
            pricePerDay: parseFloat(pricePerDay), // Asegurarse de que se guarda como número
            isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true, // Asegura que es un booleano, por defecto true
            photoUrl,
            addedBy: req.user._id, // Guarda el ID del usuario que lo creó (admin)
        });

        if (vehicle) {
            res.status(201).json({
                message: 'Vehículo creado exitosamente.',
                vehicle: {
                    _id: vehicle._id,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    pricePerDay: vehicle.pricePerDay,
                    vehicleId: vehicle.vehicleId, // El plugin mongoose-sequence ya habrá añadido este campo
                    isAvailable: vehicle.isAvailable,
                    photoUrl: vehicle.photoUrl,
                },
            });
        } else {
            res.status(400).json({ message: 'Datos de vehículo inválidos.' });
        }
    } catch (error) {
        console.error('Error al crear vehículo:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc    Obtener TODOS los vehículos (para el panel de admin/empleado)
// @route   GET /api/vehicles/all
// @access  Admin, Employee
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({});
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error al obtener todos los vehículos:', error);
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc    Obtener vehículos disponibles (para usuarios en general, en la página de inicio)
// @route   GET /api/vehicles
// @access  Authenticated Users (cualquier rol)
const getAvailableVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ isAvailable: true }); // Filtra por disponibilidad
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error al obtener vehículos disponibles:', error);
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// --- Funciones simuladas previas (mantener si aún se usan en otras rutas) ---
const addVehicle = (req, res) => { /* ... */ };
const removeVehicle = (req, res) => { /* ... */ };
const getVehicles = (req, res) => { /* ... */ };
const getReports = (req, res) => { /* ... */ };

module.exports = {
    createVehicle,
    getAllVehicles,
    getAvailableVehicles,
    addVehicle,
    removeVehicle,
    getVehicles,
    getReports
};