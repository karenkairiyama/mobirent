import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link

function Home() {
    const [username, setUsername] = useState('Usuario');
    const [userRole, setUserRole] = useState(null); // Nuevo estado para el rol
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole'); // Obtiene el rol del localStorage

        if (storedUsername && token && role) {
            setUsername(storedUsername);
            setUserRole(role); // Establece el rol en el estado
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole'); // Limpia también el rol al cerrar sesión
        navigate('/login');
    };

    if (!userRole) { // Si el rol aún no se ha cargado (o no hay sesión), no renderiza nada
        return null;
    }

    return (
        <div className="container">
            <h1>Bienvenido, <span id="welcomeUsername">{username}</span>!</h1>
            <p>Esta es tu página principal. Tu rol es: **{userRole.toUpperCase()}**</p> {/* Muestra el rol */}

            {/* Botones condicionales según el rol */}
            <div className="button-group" style={{ flexDirection: 'column', gap: '10px' }}>
                {userRole === 'employee' || userRole === 'admin' ? (
                    // Asume que tendrás una ruta /vehicles-management
                    <Link to="/vehicles-management" className="button">Gestión de Vehículos</Link>
                ) : null}

                {userRole === 'admin' ? (
                    // Asume que tendrás una ruta /admin-reports
                    <Link to="/admin-reports" className="button secondary">Ver Reportes Admin</Link>
                ) : null}

                <button onClick={handleLogout} style={{ marginTop: '20px' }}>Cerrar Sesión</button>
            </div>
        </div>
    );
}

export default Home;