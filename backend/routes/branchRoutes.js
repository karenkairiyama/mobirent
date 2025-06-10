// backend/routes/branchRoutes.js
const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branchController");
const { protect, authorize } = require("../middleware/authMiddleware");
// const Branch = require('../models/Branch'); // Esta línea ya no sería necesaria si Branch solo se usa en el controlador.

// Ruta para crear una nueva sucursal (solo para Admin)
router.post("/", protect, authorize(["admin"]), branchController.createBranch);

// Rutas para obtener todas las sucursales (pueden ser públicas o solo para usuarios autenticados)
// Por ahora, la hacemos pública para que el frontend pueda obtener la lista de sucursales para el select de vehículos.
// ¡Mantén SOLO esta línea para GET /!
router.get("/", branchController.getAllBranches);

// Rutas para obtener, actualizar y eliminar una sucursal específica por ID (solo para Admin)
router.get(
  "/:id",
  protect,
  authorize(["admin"]),
  branchController.getBranchById
);
router.put(
  "/:id",
  protect,
  authorize(["admin"]),
  branchController.updateBranch
);
router.delete(
  "/:id",
  protect,
  authorize(["admin"]),
  branchController.deleteBranch
);

module.exports = router;
