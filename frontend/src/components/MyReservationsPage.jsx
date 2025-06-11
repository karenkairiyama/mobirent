import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getMyReservations } from '../api/reservations';

const Container = styled.div`
  padding: 40px 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  text-align: center;
  color: #007bff;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #333;
`;

const Th = styled.th`
  padding: 12px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  text-align: left;
  color: #333;
`;

const Td = styled.td`
  padding: 12px;
  border: 1px solid #ddd;
  color: #333;
`;

const Tr = styled.tr`
  &:hover {
    background-color: #fafafa;
    cursor: pointer;
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  margin-top: 40px;
  color: #666;
`;

function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      // si no está autenticado, redirigir a /login
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getMyReservations();
        setReservations(data);
      } catch (err) {
        console.error('Error al cargar reservas:', err.response || err);
        setError('No se pudieron cargar tus reservas. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <Container>
        <Title>Mis Reservas</Title>
        <p>Cargando tus reservas…</p>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Mis Reservas</Title>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {reservations.length === 0 ? (
        <EmptyMessage>No tienes reservas registradas.</EmptyMessage>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>N.º de Reserva</Th>
              <Th>Vehículo</Th>
              <Th>Fechas</Th>
              <Th>Sucursal Retiro</Th>
              <Th>Sucursal Devolución</Th>
              <Th>Costo</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th> 
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <Tr
                key={r._id}
                onClick={() => navigate(`/reservations/${r._id}`)}
              >
                <Td>{r.reservationNumber}</Td>
                <Td>
                  {r.vehicle.brand} {r.vehicle.model} ({r.vehicle.licensePlate})
                </Td>
                <Td>
                  {new Date(r.startDate).toLocaleDateString('es-AR')} –{' '}
                  {new Date(r.endDate).toLocaleDateString('es-AR')}
                </Td>
                <Td>{r.pickupBranch.name}</Td>
                <Td>{r.returnBranch.name}</Td>
                <Td>ARS {r.totalCost.toFixed(2)}</Td>
                <Td style={{ textTransform: 'capitalize' }}>{r.status}</Td>
                <Td>
                 {r.status==='confirmed' && (
                   <button onClick={() => navigate(`/reservations/${r._id}`)}>
                     Cancelar Reserva
                   </button>
                  )};
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default MyReservationsPage;
