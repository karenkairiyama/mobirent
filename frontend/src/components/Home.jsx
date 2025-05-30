// frontend/src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'; // Asegúrate de que tus estilos estén importados

function Home() {
    const [username, setUsername] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');

        if (storedUsername && token && role) {
            setUsername(storedUsername);
            setUserRole(role);
        } else {
            setUsername(null);
            setUserRole(null);
        }
        // Siempre intentar cargar vehículos
        fetchAvailableVehicles(token);

    }, [navigate]);

    const fetchAvailableVehicles = async (token) => {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Esta ruta traerá los vehículos que estén 'isAvailable: true' y 'needsMaintenance: false'
            const response = await fetch('http://localhost:5000/api/vehicles', {
                method: 'GET',
                headers: headers,
            });

            const data = await response.json();
            if (response.ok) {
                setVehicles(data);
            } else {
                console.error('Error al cargar vehículos:', data.message);
                setVehicles([]);
            }
        } catch (error) {
            console.error('Error de red al cargar vehículos:', error);
            setVehicles([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        setUsername(null);
        setUserRole(null);
        setVehicles([]);
        navigate('/'); // Redirige a la LandingPage después de cerrar sesión
    };

    return (
        <div className="container">
            {username ? (
                <>
                    <h1>Bienvenido, <span id="welcomeUsername">{username}</span>!</h1>
                    <p>Esta es tu página principal. Tu rol es: **{userRole.toUpperCase()}**</p>
                </>
            ) : (
                <>
                    <h1>Explora Nuestra Flota de Vehículos</h1>
                    <p>Mira los vehículos disponibles para alquilar. ¡Regístrate o inicia sesión para reservar!</p>
                </>
            )}

            <div className="button-group" style={{ flexDirection: 'column', gap: '10px' }}>
                {username ? (
                    <>
                        {userRole === 'employee' || userRole === 'admin' ? (
                            <Link to="/vehicles-management" className="button">Gestión de Vehículos</Link>
                        ) : null}

                        {userRole === 'employee' ? (
                            <Link to="/create-user-as-employee" className="button secondary">Cargar Nuevo Cliente</Link>
                        ) : null}

                        {userRole === 'admin' ? (
                            <>
                                <Link to="/admin-reports" className="button secondary">Ver Reportes Admin</Link>
                                <Link to="/admin-users" className="button secondary">Gestionar Usuarios</Link>
                                <Link to="/admin-create-vehicle" className="button secondary">Crear Nuevo Vehículo</Link>
                                {/* NUEVO: Botón para crear sucursales (puedes añadir la ruta si creaste una página para ello) */}
                                {/* <Link to="/admin-create-branch" className="button secondary">Crear Nueva Sucursal</Link> */}
                            </>
                        ) : null}
                        <button onClick={handleLogout} style={{ marginTop: '20px' }}>Cerrar Sesión</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="button">Iniciar Sesión</Link>
                        <Link to="/register" className="button secondary">Registrarse</Link>
                    </>
                )}
            </div>

            {/* Sección para mostrar Vehículos Disponibles (siempre visible en Home) */}
            <div style={{ marginTop: '50px' }}>
                <h2>Vehículos Disponibles para Alquilar:</h2>
                {vehicles.length === 0 ? (
                    <p>No hay vehículos disponibles en este momento.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {vehicles.map(vehicle => (
                            <div key={vehicle._id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                <img src={vehicle.photoUrl || 'https://via.placeholder.com/150?text=No+Photo'} alt={`${vehicle.brand} ${vehicle.model}`} style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
                                <h3>{vehicle.brand} {vehicle.model}</h3>
                                <p>Tipo: **{vehicle.type}**</p>
                                <p>Patente: **{vehicle.licensePlate}**</p>
                                <p>Capacidad: **{vehicle.capacity} personas**</p>
                                <p>Transmisión: **{vehicle.transmission === 'automatic' ? 'Automática' : 'Manual'}**</p>
                                {/* ¡CAMBIO AQUÍ! Acceso seguro a las propiedades de la sucursal */}
                                <p>Sucursal: **{vehicle.branch ? vehicle.branch.name : 'N/A'}**</p>
                                <p style={{ fontSize: '0.8em', color: '#666' }}>Dirección: {vehicle.branch ? vehicle.branch.address : 'N/A'}</p>
                                {/* FIN CAMBIO */}
                                <p>Precio por Día: **${vehicle.pricePerDay.toFixed(2)}**</p>
                                {/* Opcional: Mostrar si está en mantenimiento, aunque getAvailableVehicles ya filtra por esto */}
                                {vehicle.needsMaintenance && <p style={{ color: 'red', fontWeight: 'bold' }}>¡En Mantenimiento!</p>}
                                <p style={{ fontSize: '0.8em', color: '#666' }}>ID: {vehicle.vehicleId}</p>

                                {/* El botón "Alquilar" se mostrará, pero la funcionalidad real requeriría estar logueado */}
                                <button className="button" style={{ width: '100%', marginTop: '10px' }}>Alquilar</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;