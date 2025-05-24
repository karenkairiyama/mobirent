// frontend/src/components/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Home() {
    const [username, setUsername] = useState(null); // Empezamos con null para saber si no hay usuario
    const [userRole, setUserRole] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');

        // Establecer el estado del usuario si está logueado
        if (storedUsername && token && role) {
            setUsername(storedUsername);
            setUserRole(role);
        } else {
            // Si no está logueado, los estados quedan en null
            setUsername(null);
            setUserRole(null);
        }
        // *********** Importante: Siempre intentar cargar vehículos ***********
        // La función fetchAvailableVehicles ahora manejará si hay token o no
        fetchAvailableVehicles(token);

    }, [navigate]); // navigate solo si se usa en el cuerpo principal del useEffect

    const fetchAvailableVehicles = async (token) => {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            // Si hay un token, lo incluimos en los headers
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:5000/api/vehicles', {
                method: 'GET',
                headers: headers, // Usamos los headers condicionales
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
        setUsername(null); // Limpiar estado del usuario al cerrar sesión
        setUserRole(null);
        setVehicles([]); // Opcional: limpiar vehículos si solo se muestran logueado, pero aquí no aplica
        navigate('/login'); // Redirige a login después de cerrar sesión
    };

    return (
        <div className="container">
            {/* *********** MODIFICACIÓN CRÍTICA: Contenido condicional para logueados/no logueados *********** */}
            {username ? ( // Si hay un username (está logueado)
                <>
                    <h1>Bienvenido, <span id="welcomeUsername">{username}</span>!</h1>
                    <p>Esta es tu página principal. Tu rol es: **{userRole.toUpperCase()}**</p>
                </>
            ) : ( // Si no hay username (no está logueado)
                <>
                    <h1>Explora Nuestra Flota de Vehículos</h1>
                    <p>Mira los vehículos disponibles para alquilar. ¡Regístrate o inicia sesión para reservar!</p>
                </>
            )}

            <div className="button-group" style={{ flexDirection: 'column', gap: '10px' }}>
                {username ? ( // Si el usuario está logueado, muestra sus botones de rol
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
                            </>
                        ) : null}
                        <button onClick={handleLogout} style={{ marginTop: '20px' }}>Cerrar Sesión</button>
                    </>
                ) : ( // Si el usuario NO está logueado, muestra Iniciar Sesión y Registrarse
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
                                <p>Precio por Día: **${vehicle.pricePerDay.toFixed(2)}**</p>
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