// frontend/src/api/payments.js
import axiosInstance from './axiosInstance';

export const payReservation = async (reservationId, paymentData) => {
  // Aquí envolvemos paymentData dentro de un objeto con clave "paymentData"
  const response = await axiosInstance.post(
    `/reservations/${reservationId}/pay`,
    { paymentData }
  );
  return response.data;
};


