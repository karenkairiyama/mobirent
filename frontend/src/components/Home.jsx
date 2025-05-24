import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [username, setUsername] = useState('Usuario');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const token = localStorage.getItem('token');

        if (storedUsername && token) {
            setUsername(storedUsername);
        } else {
            // Si no hay sesión, redirige a login
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    // No renderizar el contenido de Home si no hay token o username, mientras se redirige
    if (!localStorage.getItem('token') || !localStorage.getItem('username')) {
        return null; // O un spinner de carga
    }

    return (
        <div className="container">
            <h1>Bienvenido, <span id="welcomeUsername">{username}</span>!</h1>
            <p>Esta es tu página principal. Aquí podrás ver y gestionar tus datos.</p>
            <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
    );
}

export default Home;