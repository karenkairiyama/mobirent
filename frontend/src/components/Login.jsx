import React, { useState } from 'react';
// import '../App.css'; // Asegúrate de que tus estilos estén importados

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (e) => { // ¡Importante: usa 'async' aquí!
        e.preventDefault();
        setMessage(''); // Limpiar mensajes anteriores
        setMessageType('');

        if (!username || !password) {
            setMessage('Por favor, introduce usuario y contraseña.');
            setMessageType('error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json(); // Parsea la respuesta JSON

            if (response.ok) {
                // Si el login es exitoso, guarda el token, usuario y AHORA EL ROL en el localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userRole', data.role); // <-- ¡NUEVO! Guardar el rol
                setMessage(data.message || 'Inicio de sesión exitoso. Redirigiendo...');
                setMessageType('success');
                // Opcional: limpiar campos
                setUsername('');
                setPassword('');
                setTimeout(() => {
                    window.location.href = '/home'; // Redirige a la página principal
                }, 1000);
            } else {
                setMessage(data.message || 'Error en el inicio de sesión.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setMessage('Ocurrió un error de red o de servidor.');
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
            <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p>
            {message && <p className={`message ${messageType}`}>{message}</p>}
        </div>
    );
}

export default Login;