import React, { useEffect, useState } from 'react';
// import '../App.css'; // Si App.css tiene tus estilos generales

function Home() {
    const [username, setUsername] = useState('Usuario'); // Valor por defecto
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // En una aplicación real, aquí verificarías un token de autenticación
        // guardado en localStorage o cookies.
        const storedUsername = localStorage.getItem('username'); // Simulación
        if (storedUsername) {
            setUsername(storedUsername);
            setIsLoggedIn(true);
        } else {
            // Si no hay sesión, redirige a login
            window.location.href = '/login'; // Usaremos React Router en el futuro
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('username'); // Simulación
        // En una app real, también eliminarías el token de autenticación
        setIsLoggedIn(false);
        window.location.href = '/login'; // Redirige al login
    };

    if (!isLoggedIn) {
        return null; // O un spinner de carga, mientras redirige
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