import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance"; // Asegúrate de que esta ruta sea correcta

const PageContainer = styled.div`
  background-color: #f0f2f5;
  min-height: 100vh;
  padding: 80px 20px 40px;
  box-sizing: border-box;
  color: #333;
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    padding-top: 20px;
    align-items: center;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 15px;
    margin-top: 20px;
    width: 100%;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.8em;
  color: #007bff;
  margin-bottom: 10px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const PageSubText = styled.p`
  font-size: 1.1em;
  color: #555;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.9em;
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 20px;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
  }

  &.secondary {
    background-color: #6c757d;
    &:hover {
      background-color: #5a6268;
    }
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const FilterSidebar = styled.div`
  width: 280px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  align-self: flex-start;
  position: sticky;
  top: 100px;
  flex-shrink: 0;

  h3 {
    color: #007bff;
    margin-bottom: 20px;
    font-size: 1.5em;
  }

  @media (max-width: 768px) {
    width: 100%;
    position: static;
    top: auto;
    padding: 15px;
    margin-bottom: 20px;
    box-sizing: border-box;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
  }

  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
    box-sizing: border-box;
    margin-bottom: 10px;
  }
`;

const VehicleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
  width: 100%;
`;

const VehicleCard = styled.div`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30px;
  width: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 15px;
    gap: 15px;
  }
`;

const VehicleImage = styled.img`
  width: 250px;
  height: 150px;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 90%;
    height: 180px;
  }
`;

const VehicleDetails = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: left;

  @media (max-width: 992px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding-left: 0;
    margin-top: 15px;
  }
`;

const VehicleInfoGroupLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
`;

const VehicleInfoTop = styled.div`
  // No necesita estilos específicos aquí
`;

const VehicleName = styled.h3`
  font-size: 1.8em;
  margin-bottom: 5px;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1.5em;
  }
`;

const VehicleDescription = styled.p`
  font-size: 0.9em;
  color: #777;
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 5px;
  display: inline-block;
  margin-top: 5px;
  font-weight: bold;
`;

const VehicleSpecsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const VehicleSpecItem = styled.p`
  font-size: 0.95em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  span {
    font-weight: bold;
    color: #333;
  }

  .icon {
    color: #007bff;
    font-size: 1.1em;
  }
`;

const VehicleStatusInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
  font-size: 0.95em;
`;

const StatusText = styled.p`
  font-weight: bold;
  color: ${(props) => props.color || "#333"};
`;

const VehicleActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #eee;

  @media (max-width: 992px) {
    width: 100%;
    align-items: flex-start;
    padding-top: 15px;
  }
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const ActionButton = styled.button`
  background-color: ${(props) => props.statusColor || "#007bff"};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: bold;
  margin-top: 10px;
  transition: background-color 0.3s ease;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.1);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// **** NUEVOS STYLED COMPONENTS PARA EL MODAL ****
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
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;

  h2 {
    color: #007bff;
    font-size: 1.8em;
    margin-bottom: 10px;
  }

  p {
    color: #555;
    font-size: 1.1em;
  }

  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
    min-height: 100px;
    resize: vertical;
    box-sizing: border-box;
  }

  button {
    margin-top: 10px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
`;
// **** FIN: NUEVOS STYLED COMPONENTS PARA EL MODAL ****

// **** NUEVO STYLED COMPONENT PARA REPORTE ****
const ReportButton = styled(Button)`
  background-color: #17a2b8; /* Color info */
  &:hover {
    background-color: #138496;
  }
  margin-left: 10px; /* Espacio entre este y el botón de volver */
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  th,
  td {
    border: 1px solid #ddd;
    padding: 12px 15px;
    text-align: left;
  }

  th {
    background-color: #007bff;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.9em;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  tr:hover {
    background-color: #e9ecef;
  }

  td {
    color: #333;
    font-size: 0.9em;
  }

  @media (max-width: 768px) {
    font-size: 0.8em;
    th,
    td {
      padding: 8px 10px;
    }
    /* Esto forzaría a las tablas a ser desplazables en pantallas pequeñas */
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;

// Reutiliza o define tus styled-components base aquí
// (Copia PageContainer, MainContent, PageTitle, PageSubText, Button, ModalOverlay, ModalContent, ModalActions, etc.
// desde VehicleManagementPage.jsx o donde los tengas definidos)



const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-align: left;

  h2 {
    color: #007bff;
    font-size: 1.8em;
    margin-bottom: 15px;
    text-align: center;
  }

  div {
    display: flex;
    flex-direction: column;
  }

  label {
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
  }

  input[type="text"],
  input[type="number"] {
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
    width: 100%;
    box-sizing: border-box; /* Incluye padding en el ancho */
  }

  button {
    align-self: center;
    margin-top: 10px;
  }
`;

const TableContainer = styled.div`
  margin-top: 40px;
  overflow-x: auto;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;

  h2 {
    color: #007bff;
    font-size: 1.8em;
    margin-bottom: 20px;
    text-align: center;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th,
  td {
    padding: 12px 15px;
    border: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #007bff;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  tr:hover {
    background-color: #e9ecef;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .edit-button {
    background-color: #ffc107;
    &:hover {
      background-color: #e0a800;
    }
  }

  .delete-button {
    background-color: #dc3545;
    &:hover {
      background-color: #c82333;
    }
  }
`;


function AdicionalManagementPage() {
  const navigate = useNavigate();
  const [adicionales, setAdicionales] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Estados para edición
  const [editingAdicional, setEditingAdicional] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Estados para eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adicionalToDelete, setAdicionalToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchAdicionales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/adicionales"); // Asegúrate de que la URL es correcta (sin /api/ duplicado)
      setAdicionales(response.data);
    } catch (err) {
      console.error("Error al obtener adicionales:", err);
      setError(
        err.response?.data?.message ||
          "Error al cargar los adicionales. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    const token = localStorage.getItem("token");
    if (!token || role !== "admin") { // Solo admin puede acceder a esta página
      navigate("/login"); // Redirige si no está autenticado o no es admin
    } else {
      fetchAdicionales();
    }
  }, [navigate, fetchAdicionales]);

  const handleCreateAdicional = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosInstance.post("/adicionales", {
        name,
        price: parseFloat(price), // Asegúrate de enviar el precio como número
      });
      setSuccess(`Adicional "${response.data.name}" creado exitosamente.`);
      setName("");
      setPrice("");
      fetchAdicionales(); // Recargar la lista de adicionales
    } catch (err) {
      console.error("Error al crear adicional:", err);
      setError(
        err.response?.data?.message ||
          "Error al crear el adicional. Verifica los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (adicional) => {
    setEditingAdicional(adicional);
    setEditName(adicional.name);
    setEditPrice(adicional.price.toString()); // Convertir a string para el input
  };

  const handleUpdateAdicional = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosInstance.put(
        `/adicionales/${editingAdicional._id}`,
        {
          name: editName,
          price: parseFloat(editPrice),
        }
      );
      setSuccess(`Adicional "${response.data.name}" actualizado exitosamente.`);
      setEditingAdicional(null); // Cerrar el formulario de edición
      fetchAdicionales(); // Recargar la lista
    } catch (err) {
      console.error("Error al actualizar adicional:", err);
      setError(
        err.response?.data?.message ||
          "Error al actualizar el adicional. Verifica los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (adicional) => {
    setAdicionalToDelete(adicional);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const confirmDeleteAdicional = async () => {
    if (!adicionalToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await axiosInstance.delete(`/adicionales/${adicionalToDelete._id}`);
      setSuccess(`Adicional "${adicionalToDelete.name}" eliminado exitosamente.`);
      setShowDeleteModal(false);
      setAdicionalToDelete(null);
      fetchAdicionales(); // Recargar la lista
    } catch (err) {
      console.error("Error al eliminar adicional:", err);
      setDeleteError(
        err.response?.data?.message || "Error al eliminar el adicional."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/panel-de-control"); // O la ruta a tu panel de administración
  };

  if (userRole !== "admin") {
    return (
      <PageContainer>
        <MainContent>
          <PageTitle>Acceso Denegado</PageTitle>
          <PageSubText>
            No tienes permisos para acceder a esta página.
          </PageSubText>
          <Button onClick={handleGoBack}>Volver</Button>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <MainContent>
        <PageTitle>Gestión de Adicionales</PageTitle>
        <PageSubText>
          Crea, edita y elimina los productos adicionales disponibles para las
          reservas.
        </PageSubText>

        {/* Formulario para Crear/Editar Adicional */}
        <FormContainer onSubmit={editingAdicional ? handleUpdateAdicional : handleCreateAdicional}>
          <h2>{editingAdicional ? "Editar Adicional" : "Crear Nuevo Adicional"}</h2>
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
          {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}

          <div>
            <label htmlFor="name">Nombre del Adicional:</label>
            <input
              type="text"
              id="name"
              value={editingAdicional ? editName : name}
              onChange={(e) => editingAdicional ? setEditName(e.target.value) : setName(e.target.value)}
              placeholder="Ej: Silla de bebé, GPS, Seguro extra"
              required
            />
          </div>
          <div>
            <label htmlFor="price">Precio (ARS):</label>
            <input
              type="number"
              id="price"
              value={editingAdicional ? editPrice : price}
              onChange={(e) => editingAdicional ? setEditPrice(e.target.value) : setPrice(e.target.value)}
              placeholder="Ej: 1500.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Procesando..." : editingAdicional ? "Actualizar Adicional" : "Crear Adicional"}
          </Button>
          {editingAdicional && (
            <Button type="button" className="secondary" onClick={() => setEditingAdicional(null)} disabled={loading}>
              Cancelar Edición
            </Button>
          )}
        </FormContainer>

        {/* Tabla de Adicionales Existentes */}
        <TableContainer>
          <h2>Adicionales Existentes</h2>
          {loading && <p style={{ textAlign: "center" }}>Cargando adicionales...</p>}
          {!loading && adicionales.length === 0 && (
            <p style={{ textAlign: "center" }}>No hay adicionales creados aún.</p>
          )}
          {!loading && adicionales.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio (ARS)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {adicionales.map((adicional) => (
                  <tr key={adicional._id}>
                    <td>{adicional.name}</td>
                    <td>{adicional.price.toFixed(2)}</td>
                    <td className="action-buttons">
                      <ActionButton
                        className="edit-button"
                        onClick={() => handleEditClick(adicional)}
                        disabled={loading}
                      >
                        Editar
                      </ActionButton>
                      <ActionButton
                        className="delete-button"
                        onClick={() => handleDeleteClick(adicional)}
                        disabled={loading}
                      >
                        Eliminar
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableContainer>

        <Button onClick={handleGoBack} className="secondary" style={{ marginTop: "30px" }}>
          Volver al Panel
        </Button>
      </MainContent>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <ModalOverlay>
          <ModalContent>
            <h2>Confirmar Eliminación</h2>
            <p>
              ¿Estás seguro de que deseas eliminar el adicional{" "}
              <strong>"{adicionalToDelete?.name}"</strong>? Esta acción no se
              puede deshacer.
            </p>
            {deleteError && <p style={{ color: "red" }}>{deleteError}</p>}
            <ModalActions>
              <Button
                className="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                No, Cancelar
              </Button>
              <Button onClick={confirmDeleteAdicional} disabled={deleteLoading}>
                {deleteLoading ? "Eliminando..." : "Sí, Eliminar"}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

export default AdicionalManagementPage;