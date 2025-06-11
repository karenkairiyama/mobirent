// backend/services/refundService.js

/**
 * Calcula el monto de reembolso según la antelación a la fecha de inicio.
 *
 * Políticas:
 *  - > 24h antes de startDate: reembolso total.
 *  - > 0h y ≤ 24h antes de startDate: reembolso parcial (80%).
 *  - ≤ 0h (ya inició o está fuera de plazo): sin reembolso.
 *
 * @param {Date} startDate    - Fecha de inicio del alquiler.
 * @param {number} totalCost  - Costo total de la reserva.
 * @param {Date} [now]        - Fecha de referencia (por defecto, nueva Date()).
 * @returns {number} Monto a reembolsar.
 */
function calculateRefund(startDate, totalCost, now = new Date()) {
  // Diferencia en milisegundos
  const diffMs = startDate.getTime() - now.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);

  if (diffHrs > 24) {
    // Más de 24h → reembolso total
    return totalCost;
  }

  if (diffHrs > 0 && diffHrs <= 24) {
    // Menos de 24h antes pero aún no inició → 80% del total
    return parseFloat((totalCost * 0.8).toFixed(2));
  }

  // Ya iniciado o fuera de plazo → sin reembolso
  return 0;
}

module.exports = { calculateRefund };
