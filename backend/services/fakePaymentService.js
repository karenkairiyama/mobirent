// backend/services/fakePaymentService.js

const processPayment = async (paymentData, amount) => {
  // Simula la lógica de una pasarela de pago externa.
  // En un entorno real, aquí se integrarían librerías como Stripe, Mercado Pago, etc.

  console.log(`[FAKE PAYMENT SERVICE] Procesando pago por ARS ${amount.toFixed(2)} con datos:`, paymentData);

  // Lógica de simulación para diferentes escenarios de pago
  // Puedes usar valores específicos para simular aprobación/rechazo/pending.
  // Por ejemplo, si el número de tarjeta termina en '0000', rechazar; si termina en '1111', aprobar.

  if (paymentData.cardNumber && paymentData.cardNumber.endsWith('0000')) {
    // Simula pago rechazado (Escenario 4)
    return {
      status: 'rejected',
      transactionId: `TXN-REJ-${Date.now()}`,
      message: 'Tarjeta rechazada por el banco simulado.',
    };
  } else if (paymentData.cardNumber && paymentData.cardNumber.endsWith('1111')) {
    // Simula pago pendiente (opcional, para testear otros estados)
    return {
      status: 'pending',
      transactionId: `TXN-PEND-${Date.now()}`,
      message: 'Pago pendiente de verificación.',
    };
  } else {
    // Simula pago aprobado (Escenario 1)
    return {
      status: 'approved',
      transactionId: `TXN-APR-${Date.now()}`,
      message: 'Pago aprobado exitosamente.',
    };
  }
};

module.exports = {
  processPayment,
};