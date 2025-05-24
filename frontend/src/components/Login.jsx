import React, { useState } from 'react';
// Importa el CSS aquí si lo tienes separado o asegúrate de que App.css lo incluye
// import '../App.css'; // Si App.css tiene tus estilos generales

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' o 'error'

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage(''); // Limpiar mensajes anteriores

        if (!username || !password) {
            setMessage('Por favor, introduce usuario y contraseña.');
            setMessageType('error');
            return;
        }

        // Aquí simularemos la llamada al backend.
        // En el futuro, esto será una llamada a fetch o axios.
        console.log('Intentando iniciar sesión con:', { username, password });

        // Simulación de una respuesta del backend
        if (username === 'test' && password === 'password') {
            setMessage('Inicio de sesión exitoso. Redirigiendo...');
            setMessageType('success');
            // En una app real, guardarías el token y redirigirías
            setTimeout(() => {
                window.location.href = '/home'; // Usaremos React Router en el futuro
            }, 1000);
        } else {
            setMessage('Credenciales inválidas. Inténtalo de nuevo.');
            setMessageType('error');
        }
    };

    return (
        <div className="container">
            <h1>Iniciar Sesión</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Usuario:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>
            <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p> {/* Usaremos React Router */}
            {message && <p className={`message ${messageType}`}>{message}</p>}
        </div>
    );
}

export default Login;