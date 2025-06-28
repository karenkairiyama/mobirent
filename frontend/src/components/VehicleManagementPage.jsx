// frontend/src/components/VehicleManagementPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance"; // Asegúrate de que esta ruta sea correcta

// ... (Styled Components, no cambian aquí) ...

function VehicleManagementPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NUEVOS ESTADOS PARA EL MODAL DE MANTENIMIENTO ---
  const [showMaintenanceReasonModal, setShowMaintenanceReasonModal] =
    useState(false);
  const [vehicleToMaintainId, setVehicleToMaintainId] = useState(null);
  const [maintenanceReasonInput, setMaintenanceReasonInput] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  // --- FIN: NUEVOS ESTADOS ---

  // --- NUEVOS ESTADOS PARA EL REPORTE DE MANTENIMIENTO ---
  const [maintenanceReport, setMaintenanceReport] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  // --- FIN: NUEVOS ESTADOS ---

  // useCallback para la función de carga de datos para evitar re-creaciones
  const fetchVehiclesAndBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const branchesResponse = await axiosInstance.get("/branches");
      setBranches(branchesResponse.data);

      const vehiclesResponse = await axiosInstance.get("/vehicles/all");
      setVehicles(vehiclesResponse.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(
        err.response?.data?.message ||
          "Ocurrió un error de red o del servidor al cargar los datos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // useCallback para la función de carga del reporte
  const fetchMaintenanceReport = useCallback(async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const response = await axiosInstance.get("/vehicles/reports/maintenance");
      setMaintenanceReport(response.data.report || []); // report puede ser un array vacío
      setShowReport(true); // Muestra el reporte una vez cargado
    } catch (err) {
      console.error("Error al cargar reporte de mantenimiento:", err);
      setReportError(
        err.response?.data?.message ||
          "Ocurrió un error al generar el reporte de mantenimiento."
      );
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchVehiclesAndBranches();
  }, [navigate, fetchVehiclesAndBranches]);

  // --- MODIFICACIÓN DE handleStatusToggle para gestionar el modal ---
  const handleStatusToggle = async (vehicleId, currentStatus, type) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (type === "maintenance") {
      if (!currentStatus) {
        // Si el vehículo NO está en mantenimiento (queremos ponerlo)
        setVehicleToMaintainId(vehicleId);
        setMaintenanceReasonInput(""); // Limpiar el input para un nuevo motivo
        setModalError(null);
        setShowMaintenanceReasonModal(true); // Abrir el modal
        return; // Salir de la función, la lógica de API se manejará en handleMaintenanceReasonSubmit
      } else {
        // Si el vehículo SÍ está en mantenimiento (queremos sacarlo)
        // Aquí la lógica va directamente a la API para sacarlo de mantenimiento
        const updateBody = {
          needsMaintenance: false,
          isAvailable: true, // Asumimos que vuelve a estar disponible
          maintenanceReason: null, // Limpiar el motivo
          maintenanceStartDate: null, // Limpiar la fecha de inicio
        };
        try {
          await axiosInstance.put(`/vehicles/${vehicleId}/status`, updateBody);
          fetchVehiclesAndBranches(); // Recargar datos para reflejar el cambio
        } catch (error) {
          console.error("Error al sacar de mantenimiento:", error);
          alert(
            `Error al sacar el vehículo de mantenimiento: ${
              error.response?.data?.message || "Error desconocido"
            }`
          );
        }
      }
    }
    // Lógica existente para otros tipos de toggle (available, reserved)
    else if (type === "available" && userRole === "admin") {
      const updateBody = { isAvailable: !currentStatus };
      if (!currentStatus) {
        // Si se marca como disponible, no puede estar en mantenimiento
        updateBody.needsMaintenance = false;
      }
      try {
        await axiosInstance.put(`/vehicles/${vehicleId}/status`, updateBody);
        fetchVehiclesAndBranches(); // Recargar datos
      } catch (error) {
        console.error("Error al cambiar disponibilidad:", error);
        alert(
          `Error al actualizar disponibilidad: ${
            error.response?.data?.message || "Error desconocido"
          }`
        );
      }
    } else if (type === "reserved" && userRole === "admin") {
      const updateBody = { isReserved: !currentStatus };
      if (!currentStatus) {
        // Si se marca como reservado, se vuelve no disponible
        updateBody.isAvailable = false;
      }
      try {
        await axiosInstance.put(`/vehicles/${vehicleId}/status`, updateBody);
        fetchVehiclesAndBranches(); // Recargar datos
      } catch (error) {
        console.error("Error al cambiar estado de reserva:", error);
        alert(
          `Error al actualizar reserva: ${
            error.response?.data?.message || "Error desconocido"
          }`
        );
      }
    }
  };

  // --- NUEVA FUNCIÓN PARA ENVIAR EL MOTIVO DE MANTENIMIENTO ---
  const handleMaintenanceReasonSubmit = async () => {
    if (!maintenanceReasonInput.trim()) {
      setModalError("El motivo de mantenimiento no puede estar vacío.");
      return;
    }

    setModalLoading(true);
    setModalError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const updateBody = {
      needsMaintenance: true,
      isAvailable: false,
      isReserved: false,
      maintenanceReason: maintenanceReasonInput.trim(),
    };

    try {
      await axiosInstance.put(
        `/vehicles/${vehicleToMaintainId}/status`,
        updateBody
      );
      setShowMaintenanceReasonModal(false); // Cerrar el modal
      setVehicleToMaintainId(null);
      setMaintenanceReasonInput("");
      fetchVehiclesAndBranches(); // Recargar datos para reflejar el cambio
    } catch (error) {
      console.error("Error al poner en mantenimiento:", error);
      setModalError(
        error.response?.data?.message ||
          "Error al poner el vehículo en mantenimiento."
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Función para cerrar el modal sin enviar
  const handleCloseMaintenanceModal = () => {
    setShowMaintenanceReasonModal(false);
    setVehicleToMaintainId(null);
    setMaintenanceReasonInput("");
    setModalError(null);
    setModalLoading(false);
  };
  // --- FIN: NUEVA FUNCIÓN ---

  const handleGoBack = () => {
    navigate("/panel-de-control");
  };

  const filteredVehicles = selectedBranchFilter
    ? vehicles.filter(
        (vehicle) =>
          vehicle.branch && vehicle.branch._id === selectedBranchFilter
      )
    : vehicles;

  if (loading) {
    return (
      <PageContainer style={{ justifyContent: "center", alignItems: "center" }}>
        <PageTitle>Cargando vehículos...</PageTitle>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer style={{ justifyContent: "center", alignItems: "center" }}>
        <PageTitle>Error: {error}</PageTitle>
        <Button onClick={handleGoBack} style={{ marginTop: "20px" }}>
          Volver a Home
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FilterSidebar>
        <h3>Filtrar Vehículos</h3>
        <FilterGroup>
          <label htmlFor="branchFilter">Sucursal:</label>
          <select
            id="branchFilter"
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
          >
            <option value="">Todas las Sucursales</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name} ({branch.address})
              </option>
            ))}
          </select>
        </FilterGroup>
        <Button
          onClick={() => setSelectedBranchFilter("")}
          className="secondary"
          style={{ width: "100%" }}
        >
          Limpiar Filtro
        </Button>
        {userRole === "admin" && (
          <ReportButton
            onClick={fetchMaintenanceReport}
            disabled={reportLoading}
            style={{ width: "100%" }}
          >
            {reportLoading
              ? "Generando Reporte..."
              : "Generar Reporte Mantenimiento"}
          </ReportButton>
        )}
      </FilterSidebar>

      <MainContent>
        <PageTitle>Gestión de Vehículos</PageTitle>
        <PageSubText>
          Visualiza y gestiona el estado de los vehículos.
        </PageSubText>

        {showReport && (
          <div style={{ marginBottom: "40px" }}>
            <PageTitle style={{ fontSize: "2em" }}>
              Reporte de Mantenimiento
            </PageTitle>
            {reportError && (
              <p style={{ color: "red", textAlign: "center" }}>{reportError}</p>
            )}
            {maintenanceReport.length === 0 ? (
              <PageSubText>
                No hay vehículos en mantenimiento actualmente.
              </PageSubText>
            ) : (
              <ReportTable>
                <thead>
                  <tr>
                    <th>Patente</th>
                    <th>Modelo</th>
                    <th>Sucursal</th>
                    <th>Fecha Ingreso Mantenimiento</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceReport.map((item, index) => (
                    <tr key={index}>
                      <td>{item.patente}</td>
                      <td>{item.modelo}</td>
                      <td>{item.sucursal}</td>
                      <td>{item.fechaIngresoMantenimiento}</td>
                      <td>{item.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </ReportTable>
            )}
            <Button
              onClick={() => setShowReport(false)}
              className="secondary"
              style={{ marginTop: "20px" }}
            >
              Cerrar Reporte
            </Button>
          </div>
        )}

        {filteredVehicles.length === 0 && !showReport ? (
          <PageSubText>
            No hay vehículos para mostrar con los filtros seleccionados.
          </PageSubText>
        ) : (
          <VehicleGrid>
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id}>
                <VehicleImage
                  src={
                    vehicle.photoUrl ||
                    "https://via.placeholder.com/250x150?text=No+Photo"
                  }
                  alt={`${vehicle.brand} ${vehicle.model}`}
                />
                <VehicleDetails>
                  <VehicleInfoGroupLeft>
                    <VehicleInfoTop>
                      <VehicleName>
                        {vehicle.brand} {vehicle.model}
                      </VehicleName>
                      <VehicleDescription>
                        {vehicle.type.charAt(0).toUpperCase() +
                          vehicle.type.slice(1)}
                      </VehicleDescription>
                    </VehicleInfoTop>

                    <VehicleSpecsContainer>
                      <VehicleSpecItem>
                        <span className="icon">🔢</span>Patente:{" "}
                        <span>{vehicle.licensePlate}</span>
                      </VehicleSpecItem>
                      <VehicleSpecItem>
                        <span className="icon">👤</span>Capacidad:{" "}
                        <span>{vehicle.capacity}</span>
                      </VehicleSpecItem>
                      <VehicleSpecItem>
                        <span className="icon">⚙️</span>Transmisión:{" "}
                        <span>
                          {vehicle.transmission.charAt(0).toUpperCase() +
                            vehicle.transmission.slice(1)}
                        </span>
                      </VehicleSpecItem>
                      {/* CORRECCIÓN AQUÍ: Usa 'vehicle.branch' ya que es el nombre del campo en tu esquema */}
                      {vehicle.branch && (
                        <VehicleSpecItem>
                          <span className="icon">📍</span>Sucursal:{" "}
                          <span>{vehicle.branch.name}</span>
                        </VehicleSpecItem>
                      )}
                    </VehicleSpecsContainer>

                    <VehicleStatusInfo>
                      <StatusText
                        color={vehicle.needsMaintenance ? "orange" : "green"}
                      >
                        Mantenimiento: {vehicle.needsMaintenance ? "Sí" : "No"}
                      </StatusText>
                      {/* Muestra el motivo y la fecha de inicio del mantenimiento si está en mantenimiento */}
                      {vehicle.needsMaintenance && (
                        <>
                          <StatusText color="#777">
                            Motivo:{" "}
                            {vehicle.maintenanceReason || "No especificado"}
                          </StatusText>
                          <StatusText color="#777">
                            Fecha Ingreso:{" "}
                            {vehicle.maintenanceStartDate
                              ? new Date(
                                  vehicle.maintenanceStartDate
                                ).toLocaleDateString("es-AR")
                              : "N/A"}
                          </StatusText>
                        </>
                      )}
                      <StatusText color={vehicle.isAvailable ? "green" : "red"}>
                        Disponibilidad:{" "}
                        {vehicle.isAvailable ? "Disponible" : "No Disponible"}
                      </StatusText>
                      <StatusText
                        color={vehicle.isReserved ? "orange" : "green"}
                      >
                        Reserva:{" "}
                        {vehicle.isReserved ? "Reservado" : "No Reservado"}
                      </StatusText>
                    </VehicleStatusInfo>
                  </VehicleInfoGroupLeft>

                  <VehicleActions>
                    {userRole === "employee" && (
                      <ActionButton
                        onClick={() =>
                          handleStatusToggle(
                            vehicle._id,
                            vehicle.needsMaintenance,
                            "maintenance"
                          )
                        }
                        statusColor={
                          vehicle.needsMaintenance ? "#dc3545" : "#28a745"
                        }
                        disabled={
                          vehicle.isReserved && !vehicle.needsMaintenance
                        }
                      >
                        {vehicle.needsMaintenance
                          ? "Sacar de Mantenimiento"
                          : "Poner en Mantenimiento"}
                      </ActionButton>
                    )}
                    {userRole === "admin" && (
                      <>
                        <ActionButton
                          onClick={() =>
                            handleStatusToggle(
                              vehicle._id,
                              vehicle.isAvailable,
                              "available"
                            )
                          }
                          statusColor={
                            vehicle.isAvailable ? "#dc3545" : "#28a745"
                          }
                          disabled={
                            vehicle.needsMaintenance || vehicle.isReserved
                          }
                        >
                          {vehicle.isAvailable
                            ? "Marcar No Disponible"
                            : "Marcar Disponible"}
                        </ActionButton>

                        <ActionButton
                          onClick={() =>
                            handleStatusToggle(
                              vehicle._id,
                              vehicle.isReserved,
                              "reserved"
                            )
                          }
                          statusColor={
                            vehicle.isReserved ? "#dc3545" : "#f7b32b"
                          }
                          disabled={
                            vehicle.needsMaintenance || vehicle.isAvailable
                          }
                        >
                          {vehicle.isReserved
                            ? "Liberar Reserva"
                            : "Marcar Reservado"}
                        </ActionButton>
                      </>
                    )}
                  </VehicleActions>
                </VehicleDetails>
              </VehicleCard>
            ))}
          </VehicleGrid>
        )}

        <Button
          onClick={handleGoBack}
          className="secondary"
          style={{ marginTop: "30px" }}
        >
          Volver a Panel de Control
        </Button>
      </MainContent>

      {/* **** MODAL PARA EL MOTIVO DE MANTENIMIENTO **** */}
      {showMaintenanceReasonModal && (
        <ModalOverlay>
          <ModalContent>
            <h2>Ingresar Motivo de Mantenimiento</h2>
            <p>
              Por favor, describe la razón por la cual el vehículo será puesto
              en mantenimiento.
            </p>
            <textarea
              value={maintenanceReasonInput}
              onChange={(e) => setMaintenanceReasonInput(e.target.value)}
              placeholder="Ej: Revisión de frenos, cambio de aceite, reparación de motor..."
              rows="5"
            />
            {modalError && <p style={{ color: "red" }}>{modalError}</p>}
            <ModalActions>
              <Button
                className="secondary"
                onClick={handleCloseMaintenanceModal}
                disabled={modalLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleMaintenanceReasonSubmit}
                disabled={modalLoading}
              >
                {modalLoading ? "Confirmando..." : "Confirmar Mantenimiento"}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
      {/* **** FIN: MODAL **** */}
    </PageContainer>
  );
}

export default VehicleManagementPage;
