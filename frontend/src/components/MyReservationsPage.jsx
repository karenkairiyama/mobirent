import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance"; // Usar axiosInstance para las peticiones

// REPLICAMOS LA FUNCIÓN calculateRefund DEL BACKEND AQUÍ PARA USO EN EL FRONTEND
// Para que se pueda estimar el reembolso antes de la confirmación final.
function calculateRefund(startDate, totalCost, now = new Date()) {
  const diffMs = startDate.getTime() - now.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);

  if (diffHrs > 24) {
    return totalCost;
  }

  if (diffHrs > 0 && diffHrs <= 24) {
    return parseFloat((totalCost * 0.8).toFixed(2));
  }

  return 0;
}

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
  /* Quitar el hover y cursor pointer del Tr si el clic se va a manejar en el botón */
  /* Lo dejamos aquí por si se decide que la fila completa es clickable para ver detalles */
`;

const EmptyMessage = styled.p`
  text-align: center;
  margin-top: 40px;
  color: #666;
`;

const ActionButton = styled.button`
  background-color: #dc3545; /* Rojo para cancelar */
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// **** ESTILOS PARA EL MODAL DE CANCELACIÓN ****
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;

  h3 {
    color: #007bff;
    font-size: 1.6em;
    margin-bottom: 10px;
    text-align: center;
  }

  p {
    color: #555;
    font-size: 1em;
    line-height: 1.5;
  }

  strong {
    color: #333;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 10px 0;
  }

  li {
    margin-bottom: 5px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;

  button.secondary {
    background-color: #6c757d;
    &:hover {
      background-color: #5a6268;
    }
  }
`;

const RefundInfo = styled.div`
  background-color: #e6f7ff; /* Un azul claro para resaltar */
  border: 1px solid #91d5ff;
  border-left: 5px solid #007bff;
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
  font-size: 1.1em;
  font-weight: bold;
  color: #0056b3;

  p {
    margin: 0;
    color: #0056b3;
  }
`;

const Message = styled.p`
  color: ${(props) => (props.type === "success" ? "green" : "red")};
  text-align: center;
  margin-top: 10px;
`;
// **** FIN: ESTILOS PARA EL MODAL ****

// Función para obtener todas las reservas del usuario
const getMyReservations = async () => {
  const response = await axiosInstance.get("/reservations/myreservations");
  return response.data;
};

// Función para cancelar una reserva (la misma que llama el backend)
const apiCancelReservation = async (reservationId) => {
  const response = await axiosInstance.put(
    `/reservations/${reservationId}/cancel`
  );
  return response.data;
};

function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // --- NUEVOS ESTADOS PARA EL MODAL DE CANCELACIÓN ---
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null); // La reserva a cancelar
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancellationResult, setCancellationResult] = useState(null); // Para mostrar el resultado de la cancelación
  // --- FIN: NUEVOS ESTADOS ---

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error("Error al cargar reservas:", err.response || err);
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar tus reservas. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, []); // Dependencias vacías ya que fetchMyReservations se obtiene del closure

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate, fetchData]); // Añadir fetchData a las dependencias

  // --- LÓGICA DE CANCELACIÓN ---
  // Función que se llama cuando se presiona "Cancelar Reserva" en la tabla
  const handleCancelClick = (event, reservation) => {
    event.stopPropagation(); // Evita que se dispare el onClick del Tr
    setSelectedReservation(reservation);
    setCancelError(null);
    setCancellationResult(null); // Limpiar resultados anteriores
    setShowCancelModal(true);
  };

  // Función que se llama cuando se confirma la cancelación en el modal
  const confirmCancellation = async () => {
    if (!selectedReservation) return;

    setCancelLoading(true);
    setCancelError(null);

    try {
      // Llamar al endpoint de cancelación
      const response = await apiCancelReservation(selectedReservation._id);
      setCancellationResult({
        message: response.message,
        refundAmount: response.refundAmount,
        refundType: response.refundType,
        status: response.status, // 'cancelled'
      });
      // Actualizar la lista de reservas
      fetchData(); // Vuelve a cargar las reservas para reflejar el estado cancelado
    } catch (err) {
      console.error("Error al cancelar reserva:", err.response || err);
      setCancelError(
        err.response?.data?.message ||
          "Error desconocido al cancelar la reserva."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setShowCancelModal(false);
    setSelectedReservation(null);
    setCancellationResult(null);
    setCancelError(null);
    setCancelLoading(false);
  };
  // --- FIN LÓGICA DE CANCELACIÓN ---

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
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
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
              <Tr key={r._id}>
                {" "}
                {/* Quitamos el onClick del Tr si el botón maneja la acción */}
                <Td>{r.reservationNumber}</Td>
                <Td>
                  {r.vehicle?.brand} {r.vehicle?.model} (
                  {r.vehicle?.licensePlate})
                </Td>
                <Td>
                  {new Date(r.startDate).toLocaleDateString("es-AR")} –{" "}
                  {new Date(r.endDate).toLocaleDateString("es-AR")}
                </Td>
                <Td>{r.pickupBranch?.name}</Td>
                <Td>{r.returnBranch?.name}</Td>
                <Td>ARS {r.totalCost?.toFixed(2)}</Td>
                <Td style={{ textTransform: "capitalize" }}>{r.status}</Td>
                <Td>
                  {r.status === "confirmed" && (
                    <ActionButton
                      onClick={(e) => handleCancelClick(e, r)}
                      disabled={cancelLoading}
                    >
                      Cancelar Reserva
                    </ActionButton>
                  )}
                  {r.status === "cancelled" && r.refundAmount !== undefined && (
                    <span style={{ fontSize: "0.85em", color: "#6c757d" }}>
                      Reembolso: ARS {r.refundAmount.toFixed(2)}
                    </span>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* **** MODAL DE CANCELACIÓN **** */}
      {showCancelModal && selectedReservation && (
        <ModalOverlay>
          <ModalContent>
            <h3>Confirmar Cancelación de Reserva</h3>

            {!cancellationResult ? ( // Muestra los detalles antes de la cancelación
              <>
                <p>Estás a punto de cancelar la siguiente reserva:</p>
                <ul>
                  <li>
                    <strong>N.º de Reserva:</strong>{" "}
                    {selectedReservation.reservationNumber}
                  </li>
                  <li>
                    <strong>Vehículo:</strong>{" "}
                    {selectedReservation.vehicle?.brand}{" "}
                    {selectedReservation.vehicle?.model}
                  </li>
                  <li>
                    <strong>Fechas:</strong>{" "}
                    {new Date(selectedReservation.startDate).toLocaleDateString(
                      "es-AR"
                    )}{" "}
                    –{" "}
                    {new Date(selectedReservation.endDate).toLocaleDateString(
                      "es-AR"
                    )}
                  </li>
                  <li>
                    <strong>Costo Total:</strong> ARS{" "}
                    {selectedReservation.totalCost?.toFixed(2)}
                  </li>
                </ul>

                <RefundInfo>
                  <p>Al cancelar, el monto estimado de **DEVOLUCIÓN** será:</p>
                  <p style={{ fontSize: "1.4em", color: "#007bff" }}>
                    ARS{" "}
                    {calculateRefund(
                      new Date(selectedReservation.startDate),
                      selectedReservation.totalCost
                    ).toFixed(2)}
                  </p>
                  <p style={{ fontSize: "0.9em", color: "#007bff" }}>
                    (
                    {calculateRefund(
                      new Date(selectedReservation.startDate),
                      selectedReservation.totalCost
                    ) === selectedReservation.totalCost
                      ? "Reembolso Total"
                      : calculateRefund(
                          new Date(selectedReservation.startDate),
                          selectedReservation.totalCost
                        ) > 0
                      ? "Reembolso Parcial (80%)"
                      : "Sin Reembolso"}
                    )
                  </p>
                </RefundInfo>

                {cancelError && <Message type="error">{cancelError}</Message>}

                <ModalActions>
                  <ActionButton
                    className="secondary"
                    onClick={closeModal}
                    disabled={cancelLoading}
                  >
                    Volver
                  </ActionButton>
                  <ActionButton
                    onClick={confirmCancellation}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? "Cancelando..." : "Confirmar Cancelación"}
                  </ActionButton>
                </ModalActions>
              </>
            ) : (
              // Muestra el resultado de la cancelación
              <>
                <Message
                  type={
                    cancellationResult.status === "cancelled"
                      ? "success"
                      : "error"
                  }
                >
                  {cancellationResult.message}
                </Message>
                {cancellationResult.status === "cancelled" && (
                  <RefundInfo>
                    <p>Monto de devolución final:</p>
                    <p style={{ fontSize: "1.4em", color: "#007bff" }}>
                      ARS {cancellationResult.refundAmount.toFixed(2)}
                    </p>
                    <p style={{ fontSize: "0.9em", color: "#007bff" }}>
                      ({cancellationResult.refundType})
                    </p>
                  </RefundInfo>
                )}
                <ModalActions>
                  <ActionButton onClick={closeModal}>Cerrar</ActionButton>
                </ModalActions>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
      {/* **** FIN: MODAL **** */}
    </Container>
  );
}

export default MyReservationsPage;
