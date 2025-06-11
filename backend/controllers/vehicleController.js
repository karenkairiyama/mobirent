// backend/controllers/vehicleController.js
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const Branch = require('../models/Branch'); // Importa el modelo Branch
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
// @desc    Crear un nuevo vehículo (solo para admin)
// @route   POST /api/vehicles
// @access  Admin
const createVehicle = async (req, res) => {
    const {
        brand,
        model,
        pricePerDay,
        photoUrl,
        isAvailable,
        type,
        licensePlate,
        capacity,
        transmission,
        branch, // Ahora este 'branch' será el ID de la sucursal
        needsMaintenance
    } = req.body;

    // ************ VALIDACIONES ACTUALIZADAS ************
    // Añadimos validación para el ID de la sucursal
    if (!brand || !model || !pricePerDay || !type || !licensePlate || !capacity || !transmission || !branch) {
        return res.status(400).json({ message: 'Por favor, introduce todos los campos obligatorios: marca, modelo, precio por día, tipo, patente, capacidad, caja y ID de sucursal.' });
    }

    if (isNaN(pricePerDay) || parseFloat(pricePerDay) < 0) {
        return res.status(400).json({ message: 'El precio por día debe ser un número positivo.' });
    }
    if (isNaN(capacity) || parseInt(capacity) < 1 || parseInt(capacity) > 10) {
        return res.status(400).json({ message: 'La capacidad debe ser un número entre 1 y 10.' });
    }
    if (!['automatic', 'manual'].includes(transmission)) {
        return res.status(400).json({ message: 'El tipo de caja debe ser "manual" o "automatic".' });
    }
    if (!['sedan', 'SUV', 'compacto', 'camioneta', 'deportivo', 'furgoneta', 'otro'].includes(type)) {
        return res.status(400).json({ message: 'Tipo de vehículo no válido.' });
    }

    try {
        // 1. Verificar si la patente ya existe
        const existingVehicle = await Vehicle.findOne({ licensePlate: licensePlate.toUpperCase() });
        if (existingVehicle) {
            return res.status(409).json({ message: 'Ya existe un vehículo con esa patente.' });
        }

        // 2. Verificar si la sucursal proporcionada existe
        const targetBranch = await Branch.findById(branch);
        if (!targetBranch) {
            return res.status(404).json({ message: 'La sucursal especificada no existe.' });
        }

        // 3. Crear el vehículo
        const vehicle = await Vehicle.create({
            brand,
            model,
            pricePerDay: parseFloat(pricePerDay),
            photoUrl,
            isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
            type,
            licensePlate: licensePlate.toUpperCase(),
            capacity: parseInt(capacity),
            transmission,
            branch: targetBranch._id, // Guardamos el ObjectId de la sucursal
            needsMaintenance: typeof needsMaintenance === 'boolean' ? needsMaintenance : false,
            isReserved: false,
            addedBy: req.user._id,
        });

        // 4. Añadir el ID del vehículo a la lista de vehículos de la sucursal
        targetBranch.vehicles.push(vehicle._id);
        await targetBranch.save(); // Guarda la sucursal con el nuevo vehículo

        if (vehicle) {
            res.status(201).json({
                message: 'Vehículo creado exitosamente y asignado a la sucursal.',
                vehicle: {
                    _id: vehicle._id,
                    vehicleId: vehicle.vehicleId,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    pricePerDay: vehicle.pricePerDay,
                    isAvailable: vehicle.isAvailable,
                    photoUrl: vehicle.photoUrl,
                    type: vehicle.type,
                    licensePlate: vehicle.licensePlate,
                    capacity: vehicle.capacity,
                    transmission: vehicle.transmission,
                    branch: vehicle.branch, // Ahora es el ID de la sucursal
                    needsMaintenance: vehicle.needsMaintenance,
                },
            });
        } else {
            res.status(400).json({ message: 'Datos de vehículo inválidos o incompletos.' });
        }
    } catch (error) {
        console.error('Error al crear vehículo:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'La patente de vehículo ya existe.' });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc    Obtener TODOS los vehículos (para el panel de admin/empleado)
// @route   GET /api/vehicles/all
// @access  Admin, Employee
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({}).populate('branch');
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error al obtener todos los vehículos:', error);
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc    Obtener vehículos disponibles (para usuarios en general, en la página de inicio)
// @route   GET /api/vehicles
// @access  Authenticated Users (cualquier rol) o sin autenticar
const getAvailableVehicles = async (req, res) => {
    try {
        // Obtenemos todos los parámetros de consulta relevantes
        const { branchId, type, pickupDate, returnDate } = req.query; // Ahora sí extraemos las fechas

        let filter = {
            isAvailable: true,         // Debe estar marcado como disponible
            needsMaintenance: false    // No debe necesitar mantenimiento
            // Ya NO filtramos por 'isReserved' aquí, lo manejamos con la lógica de superposición de reservas.
        };

        // Si se proporciona un branchId, agregarlo al filtro
        if (branchId) {
            filter.branch = branchId;
        }

        // Si se proporciona un tipo de vehículo, agregarlo al filtro
        if (type) {
            filter.type = type;
        }

        let reservedVehicleIds = [];

        // Lógica para filtrar vehículos que NO tienen una reserva en el rango de fechas
        if (pickupDate && returnDate) {
            const parsedPickupDate = new Date(pickupDate);
            const parsedReturnDate = new Date(returnDate);

            // Asegurarse de que las fechas sean válidas
            if (isNaN(parsedPickupDate.getTime()) || isNaN(parsedReturnDate.getTime())) {
                return res.status(400).json({ message: 'Fechas de recogida o devolución inválidas.' });
            }

            // 1. Encontrar los IDs de vehículos que tienen reservas que se SUPERPONEN
            // con el rango de fechas solicitado.
            // Una reserva [start, end] se superpone con [reqPickup, reqReturn] si:
            // (start <= reqReturn AND end >= reqPickup)
            const overlappingReservations = await Reservation.find({
                $and: [
                    { startDate: { $lte: parsedReturnDate } }, // La reserva empieza antes o en la fecha de devolución solicitada
                    { endDate: { $gte: parsedPickupDate } }    // Y termina después o en la fecha de recogida solicitada
                ],
                // CORRECCIÓN AQUÍ: Incluye todos los estados que significan que el vehículo NO está disponible
                status: { $in: ['confirmed'] }
            }).select('vehicle'); // Solo necesitamos el campo 'vehicle' (su ID)

            // Extrae los IDs de los vehículos de las reservas superpuestas
            reservedVehicleIds = overlappingReservations.map(res => res.vehicle);

            // 2. Añadir la condición de exclusión al filtro principal
            // Esto asegura que los vehículos devueltos NO sean aquellos que están reservados.
            if (reservedVehicleIds.length > 0) {
                filter._id = { $nin: reservedVehicleIds }; // $nin significa "not in"
            }
        }

        // Ejecutar la consulta de vehículos con el filtro completo
        const vehicles = await Vehicle.find(filter).populate('branch');

        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error al obtener vehículos disponibles:', error);
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc    Actualizar el estado de un vehículo (mantenimiento o disponibilidad)
// @route   PUT /api/vehicles/:id/status
// @access  Admin, Employee
const updateVehicleStatus = async (req, res) => {
    const { id } = req.params; // ID del vehículo
    const { needsMaintenance, isAvailable } = req.body; // Campos a actualizar
    const userRole = req.user.role; // Rol del usuario autenticado

    try {
        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehículo no encontrado.' });
        }

        // Lógica condicional para actualizar según el rol
        if (userRole === 'employee') {
            // Empleados solo pueden cambiar 'needsMaintenance'
            if (typeof needsMaintenance === 'boolean') {
                vehicle.needsMaintenance = needsMaintenance;
                vehicle.isAvailable = true;
                // Si se marca en mantenimiento, se vuelve no disponible
                if (needsMaintenance) {
                    vehicle.isAvailable = false;
                    vehicle.isReserved = false; // Un vehículo en mantenimiento no puede estar reservado
                }
            } else {
                return res.status(403).json({ message: 'Los empleados solo pueden modificar el estado de mantenimiento.' });
            }
        } else if (userRole === 'admin') {
            // Administradores pueden cambiar 'needsMaintenance' y 'isAvailable'
            if (typeof needsMaintenance === 'boolean') {
                vehicle.needsMaintenance = needsMaintenance;
                // Si se marca en mantenimiento, se vuelve no disponible
                if (needsMaintenance) {
                    vehicle.isAvailable = false;
                    vehicle.isReserved = false; // Un vehículo en mantenimiento no puede estar reservado
                }
            }
            if (typeof isAvailable === 'boolean') {
                vehicle.isAvailable = isAvailable;
                // Si se marca como no disponible, no puede estar reservado
                if (!isAvailable) {
                    vehicle.isReserved = false;
                }
            }
        } else {
            return res.status(403).json({ message: 'Acceso no autorizado para esta operación.' });
        }

        await vehicle.save(); // Guarda los cambios en el vehículo

        res.status(200).json({
            message: 'Estado del vehículo actualizado exitosamente.',
            vehicle: {
                _id: vehicle._id,
                vehicleId: vehicle.vehicleId,
                brand: vehicle.brand,
                model: vehicle.model,
                needsMaintenance: vehicle.needsMaintenance,
                isAvailable: vehicle.isAvailable,
                isReserved: vehicle.isReserved, // Incluimos el estado de reservado
                // Puedes incluir más campos si el frontend los necesita
            },
        });

    } catch (error) {
        console.error('Error al actualizar estado del vehículo:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de vehículo inválido.' });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// --- Funciones simuladas previas (mantener si aún se usan en otras rutas) ---
const addVehicle = (req, res) => { res.status(501).json({ message: 'Not Implemented' }); };
const removeVehicle = (req, res) => { res.status(501).json({ message: 'Not Implemented' }); };
const getVehicles = (req, res) => { res.status(501).json({ message: 'Not Implemented' }); };
const getReports = (req, res) => { res.status(501).json({ message: 'Not Implemented' }); };

const getVehicleById = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id).populate('branch'); // .populate('branch') para obtener los detalles de la sucursal

    if (!vehicle) {
        return next(new ErrorResponse(`No se encontró vehículo con el ID de ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: vehicle
    });
});

module.exports = {
    createVehicle,
    getAllVehicles,
    getAvailableVehicles,
    updateVehicleStatus,
    addVehicle,
    removeVehicle,
    getVehicles,
    getReports,
    getVehicleById
};