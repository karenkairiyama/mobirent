// backend/controllers/branchController.js
const Branch = require('../models/Branch');
const Vehicle = require('../models/Vehicle'); // Necesitamos el modelo Vehicle para desvincular vehículos al borrar una sucursal

// @desc   Crear una nueva sucursal
// @route  POST /api/branches
// @access Private/Admin
const createBranch = async (req, res) => {
    const { name, address } = req.body;

    if (!name || !address) {
        return res.status(400).json({ message: 'El nombre y la dirección de la sucursal son obligatorios.' });
    }

    try {
        // Verificar si ya existe una sucursal con el mismo nombre
        const existingBranch = await Branch.findOne({ name });
        if (existingBranch) {
            return res.status(409).json({ message: 'Ya existe una sucursal con ese nombre.' });
        }

        const branch = await Branch.create({
            name,
            address,
            vehicles: [] // Inicialmente, no hay vehículos asociados
        });

        res.status(201).json({ message: 'Sucursal creada exitosamente.', branch });
    } catch (error) {
        console.error('Error al crear sucursal:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc   Obtener todas las sucursales
// @route  GET /api/branches
// @access Public (o Private/Admin si lo decides más adelante)
const getAllBranches = async (req, res) => {
    try {
        // Usamos .populate('vehicles') para obtener los detalles completos de los vehículos
        // en lugar solo de sus IDs. Esto puede ser costoso si hay muchos vehículos.
        // Considera si realmente necesitas toda la información del vehículo aquí o solo los IDs.
        const branches = await Branch.find().populate('vehicles');
        res.status(200).json(branches);
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc   Obtener una única sucursal por ID
// @route  GET /api/branches/:id
// @access Public (o Private/Admin)
const getBranchById = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id).populate('vehicles');
        if (!branch) {
            return res.status(404).json({ message: 'Sucursal no encontrada.' });
        }
        res.status(200).json(branch);
    } catch (error) {
        console.error('Error al obtener sucursal por ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de sucursal inválido.' });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc   Actualizar una sucursal
// @route  PUT /api/branches/:id
// @access Private/Admin
const updateBranch = async (req, res) => {
    const { name, address } = req.body;

    if (!name || !address) {
        return res.status(400).json({ message: 'El nombre y la dirección son obligatorios para actualizar.' });
    }

    try {
        // Opcional: Verificar si el nuevo nombre ya existe en otra sucursal
        const existingBranch = await Branch.findOne({ name });
        if (existingBranch && existingBranch._id.toString() !== req.params.id) {
            return res.status(409).json({ message: 'Ya existe una sucursal con ese nombre.' });
        }

        const branch = await Branch.findByIdAndUpdate(
            req.params.id,
            { name, address },
            { new: true, runValidators: true } // new: true devuelve el documento actualizado; runValidators: true ejecuta las validaciones del esquema
        );
        if (!branch) {
            return res.status(404).json({ message: 'Sucursal no encontrada.' });
        }
        res.status(200).json({ message: 'Sucursal actualizada exitosamente.', branch });
    } catch (error) {
        console.error('Error al actualizar sucursal:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de sucursal inválido.' });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

// @desc   Eliminar una sucursal
// @route  DELETE /api/branches/:id
// @access Private/Admin
const deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findByIdAndDelete(req.params.id);
        if (!branch) {
            return res.status(404).json({ message: 'Sucursal no encontrada.' });
        }

        // Importante: Eliminar la referencia a esta sucursal en todos los vehículos asociados.
        // No los eliminamos, solo desvinculamos. Si quieres eliminar los vehículos también,
        // la lógica sería más compleja y debería ser una decisión de diseño.
        await Vehicle.updateMany(
            { branch: req.params.id }, // Busca vehículos que estén asignados a esta sucursal
            { $unset: { branch: 1 } } // Elimina el campo 'branch' de esos vehículos
            // O podrías $set: { branch: null } si prefieres mantener el campo con valor nulo
        );

        res.status(200).json({ message: 'Sucursal eliminada exitosamente y vehículos desvinculados.' });
    } catch (error) {
        console.error('Error al eliminar sucursal:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de sucursal inválido.' });
        }
        res.status(500).json({ message: `Error del servidor: ${error.message}` });
    }
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
};