import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getReservationById } from '../api/reservations';

const Container = styled.div`
  max-width: 700px;
  margin: 60px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #007bff;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 20px;
  color: #333;
`;

const Label = styled.span`
  font-weight: bold;
  color: #333;
`;

const Value = styled.span`
  color: #555;
`;

const BackButton = styled.button`
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block;
  margin-top: 20px;
  &:hover {
    background-color: #5a6268;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  text-align: center;
`;

const ReminderMessage = styled.p`
  margin-top: 25px; // Espacio extra arriba
  padding: 15px;
  background-color: #e6f7ff; // Un azul claro
  border: 1px solid #91d5ff;
  border-radius: 8px;
  color: #0047b3; // Un azul más oscuro para el texto
  text-align: center;
  font-size: 0.95em;
  font-weight: 500;
`;

function ReservationDetailPage() {
  const { id } = useParams(); // este “id” es el _id de la reserva
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
    const fetchData = async () => {
      try {
        const data = await getReservationById(id);
        setReservation(data);
      } catch (err) {
        console.error('Error al cargar detalle de reserva:', err.response || err);
        setError('No se pudo obtener la información de la reserva.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated, navigate]);
  // Logs en el renderizado
  console.log('DEBUG [ReservationDetailPage]: Estado "loading":', loading); // 3. Log del estado de carga
  console.log('DEBUG [ReservationDetailPage]: Objeto "reservation" en el render:', reservation); // 4. Log del objeto reservation


  if (loading) {
    return (
      <Container>
        <Title>Detalle de Reserva</Title>
        <p style={{ textAlign: 'center', color: '#555' }}>Cargando información…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Detalle de Reserva</Title>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={() => navigate(-1)}>Volver</BackButton>
      </Container>
    );
  }

  if (!reservation) {
    return (
      <Container>
        <Title>Detalle de Reserva</Title>
        <ErrorMessage>Reserva no encontrada.</ErrorMessage>
        <BackButton onClick={() => navigate(-1)}>Volver</BackButton>
      </Container>
    );
  }

  // Formato legible de fechas
  const start = new Date(reservation.startDate).toLocaleDateString('es-AR');
  const end   = new Date(reservation.endDate).toLocaleDateString('es-AR');

  return (
    <Container>
      <Title>Detalle de Reserva #{reservation.reservationNumber}</Title>

      <Section>
        <Label>Estado:</Label>{' '}
        <Value style={{ textTransform: 'capitalize' }}>{reservation.status}</Value>
      </Section>

      <Section>
        <Label>Vehículo:</Label>{' '}
        <Value>
          {reservation.vehicle.brand} {reservation.vehicle.model} (
          {reservation.vehicle.licensePlate})
        </Value>
      </Section>

      <Section>
        <Label>Fechas de alquiler:</Label>{' '}
        <Value>{start} – {end}</Value>
      </Section>

      <Section>
        <Label>Sucursal de Retiro:</Label>{' '}
        <Value>{reservation.pickupBranch.name} ({reservation.pickupBranch.address})</Value>
      </Section>

      <Section>
        <Label>Sucursal de Devolución:</Label>{' '}
        <Value>{reservation.returnBranch.name} ({reservation.returnBranch.address})</Value>
      </Section>

      <Section>
        <Label>Costo Total:</Label>{' '}
        <Value>ARS {reservation.totalCost.toFixed(2)}</Value>
      </Section>

      <Section>
        <Label>Creada:</Label>{' '}
        <Value>{new Date(reservation.createdAt).toLocaleString('es-AR')}</Value>
      </Section>

      {reservation.paymentInfo && reservation.paymentInfo.status && (
        <Section>
          <Label>Pago:</Label>{' '}
          <Value style={{ textTransform: 'capitalize' }}>
            {reservation.paymentInfo.status}
          </Value>
        </Section>
      )}
      
      
      {/* Mostrar el mensaje de recordatorio solo si la reserva está confirmada */}
      {console.log('DEBUG [ReservationDetailPage]: reservation.status para recordatorio:', reservation.status)} // 5. Log de la condición exacta
      {reservation.status === 'confirmed' && (
        <ReminderMessage>
          Recibirás un recordatorio por email 2 días antes de la fecha de retiro de tu vehículo.
        </ReminderMessage>
      )}


      <BackButton onClick={() => navigate('/my-reservations')}>
        Volver a Mi Historial
      </BackButton>
    </Container>
  );
}

export default ReservationDetailPage;
