const asyncHandler = require('express-async-handler'); // Para manejar errores asíncronos
const Adicional = require('../models/Adicional'); // Importa el modelo Adicional

/**
 * @desc    Crear un nuevo adicional
 * @route   POST /api/adicionales
 * @access  Private (Admin)
 */
const createAdicional = asyncHandler(async (req, res) => {
  const { name, price } = req.body;

  // Validaciones básicas
  if (!name || price === undefined || price === null) {
    res.status(400);
    throw new Error('Por favor, ingresa el nombre y el precio del adicional.');
  }

  // Verificar si ya existe un adicional con el mismo nombre
  const adicionalExists = await Adicional.findOne({ name });
  if (adicionalExists) {
    res.status(400);
    throw new Error('Ya existe un adicional con ese nombre.');
  }

  // Crear el adicional en la base de datos
  const adicional = await Adicional.create({
    name,
    price,
  });

  // Responder con el adicional creado
  if (adicional) {
    res.status(201).json({
      _id: adicional._id,
      name: adicional.name,
      price: adicional.price,
      createdAt: adicional.createdAt,
      updatedAt: adicional.updatedAt,
    });
  } else {
    res.status(400);
    throw new Error('Datos de adicional inválidos.');
  }
});

/**
 * @desc    Obtener todos los adicionales
 * @route   GET /api/adicionales
 * @access  Private (Admin, o al menos autenticado si se usa en el frontend para selección)
 */
const getAdicionales = asyncHandler(async (req, res) => {
  const adicionales = await Adicional.find({}); // Encuentra todos los adicionales
  res.status(200).json(adicionales);
});

const getAdicionalesAvailable = asyncHandler(async (req, res) => {
  const adicionales = await Adicional.find({ isActive: true }); // Solo adicionales disponibles
  res.status(200).json(adicionales);
});

/**
 * @desc    Obtener un adicional por ID
 * @route   GET /api/adicionales/:id
 * @access  Private (Admin)
 */
const getAdicionalById = asyncHandler(async (req, res) => {
  const adicional = await Adicional.findById(req.params.id);

  if (adicional) {
    res.status(200).json(adicional);
  } else {
    res.status(404);
    throw new Error('Adicional no encontrado.');
  }
});

/**
 * @desc    Actualizar un adicional
 * @route   PUT /api/adicionales/:id
 * @access  Private (Admin)
 */
const updateAdicional = asyncHandler(async (req, res) => {
  const { name, price } = req.body;

  const adicional = await Adicional.findById(req.params.id);

  if (adicional) {
    // Actualizar campos si se proporcionan en el cuerpo de la petición
    adicional.name = name || adicional.name;
    adicional.price = price !== undefined ? price : adicional.price; // Permite actualizar a 0

    const updatedAdicional = await adicional.save(); // Guarda los cambios
    res.status(200).json({
      _id: updatedAdicional._id,
      name: updatedAdicional.name,
      price: updatedAdicional.price,
      createdAt: updatedAdicional.createdAt,
      updatedAt: updatedAdicional.updatedAt,
    });
  } else {
    res.status(404);
    throw new Error('Adicional no encontrado.');
  }
});

/**
 * @desc    Eliminar un adicional
 * @route   DELETE /api/adicionales/:id
 * @access  Private (Admin)
 */
const deleteAdicional = asyncHandler(async (req, res) => {
  const adicional = await Adicional.findById(req.params.id);

  if (adicional) {
    await Adicional.deleteOne({ _id: adicional._id }); // Elimina el documento
    res.status(200).json({ message: 'Adicional eliminado correctamente.' });
  } else {
    res.status(404);
    throw new Error('Adicional no encontrado.');
  }
});

module.exports = {
  createAdicional,
  getAdicionales,
  getAdicionalById,
  updateAdicional,
  deleteAdicional,
  getAdicionalesAvailable
};