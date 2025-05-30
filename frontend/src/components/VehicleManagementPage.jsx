// frontend/src/components/VehicleManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Asegúrate de que tus estilos estén importados

function VehicleManagementPage() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranchFilter, setSelectedBranchFilter] = useState(''); // Estado para el filtro de sucursal
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener rol del usuario y cargar datos al montar el componente
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Redirigir si no hay token
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Cargar sucursales
                const branchesResponse = await fetch('http://localhost:5000/api/branches', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const branchesData = await branchesResponse.json();
                if (branchesResponse.ok) {
                    setBranches(branchesData);
                } else {
                    setError(branchesData.message || 'Error al cargar sucursales.');
                }

                // Cargar todos los vehículos
                const vehiclesResponse = await fetch('http://localhost:5000/api/vehicles/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const vehiclesData = await vehiclesResponse.json();
                if (vehiclesResponse.ok) {
                    setVehicles(vehiclesData);
                } else {
                    setError(vehiclesData.message || 'Error al cargar vehículos.');
                }

            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Ocurrió un error de red o del servidor al cargar los datos.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]); // Dependencia de navigate para evitar warnings

    // Función para manejar el cambio de estado (mantenimiento/disponibilidad)
    const handleStatusToggle = async (vehicleId, currentStatus, type) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        let updateBody = {};
        if (type === 'maintenance') {
            updateBody = { needsMaintenance: !currentStatus };
            // Si se pone en mantenimiento, también se vuelve no disponible
            if (!currentStatus === true) { // Si el nuevo estado es true (pasa a mantenimiento)
                updateBody.isAvailable = false;
            }
        } else if (type === 'available') {
            updateBody = { isAvailable: !currentStatus };
            // Si se pone disponible, no puede estar en mantenimiento
            if (!currentStatus === true) { // Si el nuevo estado es true (pasa a disponible)
                updateBody.needsMaintenance = false;
            }
        }

        try {
            const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateBody),
            });

            const data = await response.json();
            if (response.ok) {
                // Actualizar el estado local del vehículo
                setVehicles(prevVehicles =>
                    prevVehicles.map(v =>
                        v._id === vehicleId ? { ...v, ...data.vehicle } : v
                    )
                );
            } else {
                alert(`Error al actualizar el estado: ${data.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error de red al actualizar estado:', error);
            alert('Error de red al intentar actualizar el estado del vehículo.');
        }
    };

    const handleGoBack = () => {
        navigate('/home');
    };

    // Filtrar vehículos por sucursal seleccionada
    const filteredVehicles = selectedBranchFilter
        ? vehicles.filter(vehicle => vehicle.branch && vehicle.branch._id === selectedBranchFilter)
        : vehicles;

    if (loading) {
        return (
            <div className="container">
                <h1>Cargando vehículos...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <h1>Error: {error}</h1>
                <button onClick={handleGoBack} style={{ marginTop: '20px' }}>
                    Volver a Home
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Gestión de Vehículos</h1>
            <p>Visualiza y gestiona el estado de los vehículos.</p>

            <div className="filter-controls" style={{ marginBottom: '20px' }}>
                <label htmlFor="branchFilter">Filtrar por Sucursal:</label>
                <select
                    id="branchFilter"
                    value={selectedBranchFilter}
                    onChange={(e) => setSelectedBranchFilter(e.target.value)}
                    style={{ marginLeft: '10px', padding: '8px', borderRadius: '5px' }}
                >
                    <option value="">Todas las Sucursales</option>
                    {branches.map(branch => (
                        <option key={branch._id} value={branch._id}>
                            {branch.name} ({branch.address})
                        </option>
                    ))}
                </select>
            </div>

            {filteredVehicles.length === 0 ? (
                <p>No hay vehículos para mostrar con los filtros seleccionados.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredVehicles.map(vehicle => (
                        <div key={vehicle._id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <img src={vehicle.photoUrl || 'https://via.placeholder.com/150?text=No+Photo'} alt={`${vehicle.brand} ${vehicle.model}`} style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
                            <h3>{vehicle.brand} {vehicle.model}</h3>
                            <p>Tipo: **{vehicle.type}**</p>
                            <p>Patente: **{vehicle.licensePlate}**</p>
                            <p>Capacidad: **{vehicle.capacity} personas**</p>
                            <p>Transmisión: **{vehicle.transmission === 'automatic' ? 'Automática' : 'Manual'}**</p>
                            <p>Sucursal: **{vehicle.branch ? vehicle.branch.name : 'N/A'}**</p>
                            <p style={{ fontSize: '0.8em', color: '#666' }}>Dirección: {vehicle.branch ? vehicle.branch.address : 'N/A'}</p>
                            <p>Precio por Día: **${vehicle.pricePerDay.toFixed(2)}**</p>
                            <p>Estado de Mantenimiento: <strong style={{ color: vehicle.needsMaintenance ? 'orange' : 'green' }}>{vehicle.needsMaintenance ? 'Sí' : 'No'}</strong></p>
                            <p>Estado de Disponibilidad: <strong style={{ color: vehicle.isAvailable ? 'green' : 'red' }}>{vehicle.isAvailable ? 'Disponible' : 'No Disponible'}</strong></p>
                            <p>Estado de Reserva: <strong style={{ color: vehicle.isReserved ? 'orange' : 'green' }}>{vehicle.isReserved ? 'Reservado' : 'No Reservado'}</strong></p>

                            {/* Botones de acción condicionales según el rol */}
                            {userRole === 'employee' && (
                                <button
                                    className="button"
                                    onClick={() => handleStatusToggle(vehicle._id, vehicle.needsMaintenance, 'maintenance')}
                                    style={{ backgroundColor: vehicle.needsMaintenance ? '#dc3545' : '#28a745', color: 'white', marginTop: '10px' }}
                                >
                                    {vehicle.needsMaintenance ? 'Sacar de Mantenimiento' : 'Poner en Mantenimiento'}
                                </button>
                            )}

                            {userRole === 'admin' && (
                                <button
                                    className="button"
                                    onClick={() => handleStatusToggle(vehicle._id, vehicle.isAvailable, 'available')}
                                    style={{ backgroundColor: vehicle.isAvailable ? '#dc3545' : '#28a745', color: 'white', marginTop: '10px' }}
                                >
                                    {vehicle.isAvailable ? 'Marcar como No Disponible' : 'Marcar como Disponible'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button onClick={handleGoBack} style={{ marginTop: '30px' }}>
                Volver a Home
            </button>
        </div>
    );
}

export default VehicleManagementPage;