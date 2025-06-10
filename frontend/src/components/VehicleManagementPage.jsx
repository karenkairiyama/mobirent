// frontend/src/components/VehicleManagementPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components'; // Importa styled-components
import axiosInstance from '../api/axiosInstance';
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
    margin-top: 20px; // Espacio superior para botones de acción general

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
    flex-direction: column; // Apila las tarjetas verticalmente
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
    flex-direction: row; // Los elementos internos se alinean horizontalmente
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
    // No necesita estilos específicos aquí ya que está manejado por VehicleInfoGroupLeft
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
    margin-top: 10px; // Espacio entre specs y estados
    font-size: 0.95em;
`;

const StatusText = styled.p`
    font-weight: bold;
    color: ${props => props.color || '#333'};
`;

const VehicleActions = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-top: auto; // Empuja al final si VehicleDetails es flex-column
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
    background-color: ${props => props.statusColor || '#007bff'};
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.95em;
    font-weight: bold;
    margin-top: 10px;
    transition: background-color 0.3s ease;
    white-space: nowrap; // Evita que el texto del botón se rompa

    &:hover {
        filter: brightness(1.1);
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

// **** FIN: Styled Components ****


function VehicleManagementPage() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranchFilter, setSelectedBranchFilter] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useCallback para la función de carga de datos para evitar re-creaciones
    const fetchVehiclesAndBranches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Usa axiosInstance para las ramas

            const branchesResponse = await axiosInstance.get('/branches'); 
            setBranches(branchesResponse.data);

            
             // Usa axiosInstance para los vehículos
            const vehiclesResponse = await axiosInstance.get('/vehicles/all'); // <--- CAMBIO AQUÍ
            setVehicles(vehiclesResponse.data);

        } catch (err) {
            console.error('Error al cargar datos:', err);
            // Axios envuelve los errores de respuesta en err.response.data
            setError(err.response?.data?.message || 'Ocurrió un error de red o del servidor al cargar los datos.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchVehiclesAndBranches();
    }, [navigate, fetchVehiclesAndBranches]); // Dependencias para re-ejecutar

    const handleStatusToggle = async (vehicleId, currentStatus, type) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        let updateBody = {};
        if (type === 'maintenance') {
            updateBody = { needsMaintenance: !currentStatus };
            if (!currentStatus === true) { // Si el nuevo estado es true (pasa a mantenimiento)
                updateBody.isAvailable = false; // Se vuelve no disponible
            }
        } else if (type === 'available') {
            updateBody = { isAvailable: !currentStatus };
            if (!currentStatus === true) { // Si el nuevo estado es true (pasa a disponible)
                updateBody.needsMaintenance = false; // No puede estar en mantenimiento
            }
        } else if (type === 'reserved') {
            updateBody = { isReserved: !currentStatus };
            if (!currentStatus === true) { // Si el nuevo estado es true (pasa a reservado)
                updateBody.isAvailable = false; // Se vuelve no disponible
            }
        }

        try {
            // Usa axiosInstance para actualizar el estado
            const response = await axiosInstance.put(`/vehicles/${vehicleId}/status`, updateBody); // <--- CAMBIO AQUÍ
            // Axios devuelve los datos directamente en response.data
            setVehicles(prevVehicles =>
                prevVehicles.map(v =>
                    v._id === vehicleId ? { ...v, ...response.data.vehicle } : v // <--- CAMBIO AQUÍ
                )
            );
        } catch (error) {
            console.error('Error de red al actualizar estado:', error);
            alert(`Error al actualizar el estado: ${error.response?.data?.message || 'Error desconocido'}`); // <--- CAMBIO AQUÍ
        }
    };
     

    const handleGoBack = () => {
        navigate('/home');
    };

    const filteredVehicles = selectedBranchFilter
        ? vehicles.filter(vehicle => vehicle.branch && vehicle.branch._id === selectedBranchFilter)
        : vehicles;

    if (loading) {
        return (
            <PageContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
                <PageTitle>Cargando vehículos...</PageTitle>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
                <PageTitle>Error: {error}</PageTitle>
                <Button onClick={handleGoBack} style={{ marginTop: '20px' }}>
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
                        {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>
                                {branch.name} ({branch.address})
                            </option>
                        ))}
                    </select>
                </FilterGroup>
                <Button onClick={() => setSelectedBranchFilter('')} className="secondary" style={{ width: '100%' }}>
                    Limpiar Filtro
                </Button>
            </FilterSidebar>

            <MainContent>
                <PageTitle>Gestión de Vehículos</PageTitle>
                <PageSubText>Visualiza y gestiona el estado de los vehículos.</PageSubText>

                {filteredVehicles.length === 0 ? (
                    <PageSubText>No hay vehículos para mostrar con los filtros seleccionados.</PageSubText>
                ) : (
                    <VehicleGrid>
                        {filteredVehicles.map(vehicle => (
                            <VehicleCard key={vehicle._id}>
                                <VehicleImage
                                    src={vehicle.photoUrl || 'https://via.placeholder.com/250x150?text=No+Photo'}
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                />
                                <VehicleDetails>
                                    <VehicleInfoGroupLeft>
                                        <VehicleInfoTop>
                                            <VehicleName>{vehicle.brand} {vehicle.model}</VehicleName>
                                            <VehicleDescription>
                                                {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                                            </VehicleDescription>
                                        </VehicleInfoTop>

                                        <VehicleSpecsContainer>
                                            <VehicleSpecItem>
                                                <span className="icon">🔢</span>Patente: <span>{vehicle.licensePlate}</span>
                                            </VehicleSpecItem>
                                            <VehicleSpecItem>
                                                <span className="icon">👤</span>Capacidad: <span>{vehicle.capacity}</span>
                                            </VehicleSpecItem>
                                            <VehicleSpecItem>
                                                <span className="icon">⚙️</span>Transmisión: <span>{vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1)}</span>
                                            </VehicleSpecItem>
                                            {vehicle.branch && (
                                                <VehicleSpecItem>
                                                    <span className="icon">📍</span>Sucursal: <span>{vehicle.branch.name}</span>
                                                </VehicleSpecItem>
                                            )}
                                        </VehicleSpecsContainer>

                                        <VehicleStatusInfo>
                                            <StatusText color={vehicle.needsMaintenance ? 'orange' : 'green'}>
                                                Mantenimiento: {vehicle.needsMaintenance ? 'Sí' : 'No'}
                                            </StatusText>
                                            <StatusText color={vehicle.isAvailable ? 'green' : 'red'}>
                                                Disponibilidad: {vehicle.isAvailable ? 'Disponible' : 'No Disponible'}
                                            </StatusText>
                                            <StatusText color={vehicle.isReserved ? 'orange' : 'green'}>
                                                Reserva: {vehicle.isReserved ? 'Reservado' : 'No Reservado'}
                                            </StatusText>
                                        </VehicleStatusInfo>
                                    </VehicleInfoGroupLeft>

                                    <VehicleActions>
                                        {userRole === 'employee' && (
                                            <ActionButton
                                                onClick={() => handleStatusToggle(vehicle._id, vehicle.needsMaintenance, 'maintenance')}
                                                statusColor={vehicle.needsMaintenance ? '#dc3545' : '#28a745'}
                                                disabled={vehicle.isReserved && !vehicle.needsMaintenance} // Deshabilita si está reservado y no en mantenimiento
                                            >
                                                {vehicle.needsMaintenance ? 'Sacar de Mantenimiento' : 'Poner en Mantenimiento'}
                                            </ActionButton>
                                        )}
                                        {userRole === 'admin' && ( // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                                            <>
                                                <ActionButton
                                                    onClick={() => handleStatusToggle(vehicle._id, vehicle.isAvailable, 'available')}
                                                    statusColor={vehicle.isAvailable ? '#dc3545' : '#28a745'}
                                                    disabled={vehicle.needsMaintenance || vehicle.isReserved} // No puede estar disponible si está en mantenimiento o reservado
                                                >
                                                    {vehicle.isAvailable ? 'Marcar como No Disponible' : 'Marcar como Disponible'}
                                                </ActionButton>
                                                
                                                <ActionButton //es al pedo se puede borrar
                                                    onClick={() => handleStatusToggle(vehicle._id, vehicle.isReserved, 'reserved')}
                                                    statusColor={vehicle.isReserved ? '#dc3545' : '#f7b32b'} // Amarillo para "no reservado"
                                                    disabled={vehicle.needsMaintenance || vehicle.isAvailable} // No puede cambiar reserva si está en mantenimiento o disponible (si ya está reservado no importa si es el mismo usuario)
                                                >
                                                    {vehicle.isReserved ? 'Liberar Reserva' : 'Marcar como Reservado'}
                                                </ActionButton>
                                            </>
                                        )}
                                    </VehicleActions>
                                </VehicleDetails>
                            </VehicleCard>
                        ))}
                    </VehicleGrid>
                )}

                <Button onClick={handleGoBack} className="secondary" style={{ marginTop: '30px' }}>
                    Volver a Home
                </Button>
            </MainContent>
        </PageContainer>
    );
}

export default VehicleManagementPage;