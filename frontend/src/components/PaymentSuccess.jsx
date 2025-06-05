// frontend/src/components/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getReservationById } from '../api/reservations';

const Container = styled.div`
  max-width: 600px;
  margin: 80px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
`;

const Title = styled.h2`
  color: #28a745;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 15px;
  text-align: left;
  line-height: 1.4;
  color: #333;
`;

const Label = styled.span`
  font-weight: bold;
  color: #333;
`;

const Value = styled.span`
  margin-left: 5px;
  color: #555;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 30px;
  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  margin-bottom: 20px;
`;

function PaymentSuccess() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchReservation = async () => {
      try {
        const data = await getReservationById(reservationId);
        setReservation(data);
      } catch (err) {
        console.error('Error cargando reserva:', err.response || err);
        setError('No se pudo obtener la información de la reserva.');
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [isAuthenticated, reservationId, navigate]);

  if (loading) {
    return (
      <Container>
        <Title>Procesando Pago…</Title>
        <p>Cargando información de la reserva.</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Ocurrió un error</Title>
        <ErrorMessage>{error}</ErrorMessage>
        <Button onClick={() => navigate('/my-reservations')}>Volver a Mis Reservas</Button>
      </Container>
    );
  }

  if (!reservation) {
    return (
      <Container>
        <Title>Reserva no encontrada</Title>
        <Button onClick={() => navigate('/my-reservations')}>Volver a Mis Reservas</Button>
      </Container>
    );
  }

  // Formato legible
  const startDateStr = new Date(reservation.startDate).toLocaleDateString('es-AR');
  const endDateStr   = new Date(reservation.endDate).toLocaleDateString('es-AR');

  return (
    <Container>
      <Title>¡Pago Aprobado!</Title>

      <Section>
        <Label>Número de Reserva:</Label>
        <Value>{reservation.reservationNumber}</Value>
      </Section>

      <Section>
        <Label>Vehículo:</Label>
        <Value>
          {reservation.vehicle.brand} {reservation.vehicle.model} (
          {reservation.vehicle.licensePlate})
        </Value>
      </Section>

      <Section>
        <Label>Fechas:</Label>
        <Value>{startDateStr} – {endDateStr}</Value>
      </Section>

      <Section>
        <Label>Sucursal Retiro:</Label>
        <Value>{reservation.pickupBranch.name} ({reservation.pickupBranch.address})</Value>
      </Section>

      <Section>
        <Label>Sucursal Devolución:</Label>
        <Value>{reservation.returnBranch.name} ({reservation.returnBranch.address})</Value>
      </Section>

      <Section>
        <Label>Costo Total:</Label>
        <Value>ARS {reservation.totalCost.toFixed(2)}</Value>
      </Section>

      <Section>
        <Label>Estado:</Label>
        <Value style={{ textTransform: 'capitalize' }}>{reservation.status}</Value>
      </Section>

      <Button onClick={() => navigate('/my-reservations')}>Ir a Mis Reservas</Button>
    </Container>
  );
}

export default PaymentSuccess;
