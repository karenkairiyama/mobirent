import React, { useState } from 'react';
// import '../App.css'; // Asegúrate de que tus estilos estén importados en App.css o aquí

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (e) => { // ¡Importante: usa 'async' aquí!
        e.preventDefault();
        setMessage(''); // Limpiar mensajes anteriores
        setMessageType('');

        if (!username || !password || !confirmPassword) {
            setMessage('Todos los campos son obligatorios.');
            setMessageType('error');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Las contraseñas no coinciden.');
            setMessageType('error');
            return;
        }

        try {
            // Realizar la petición POST al backend
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }), // Envía los datos como JSON
            });

            const data = await response.json(); // Parsea la respuesta JSON

            if (response.ok) { // Si la respuesta HTTP es 200-299 (éxito)
                setMessage(data.message || 'Registro exitoso. Redirigiendo a login...');
                setMessageType('success');
                // Opcional: limpiar los campos después del registro exitoso
                setUsername('');
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    window.location.href = '/login'; // Redirige usando el navegador
                }, 2000);
            } else { // Si hay un error (ej. 400, 401, 500)
                setMessage(data.message || 'Error en el registro.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            setMessage('Ocurrió un error de red o de servidor.');
            setMessageType('error');
        }
    };

    return (
        <div className="container">
            <h1>Registrarse</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="regUsername">Usuario:</label>
                    <input
                        type="text"
                        id="regUsername"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="regPassword">Contraseña:</label>
                    <input
                        type="password"
                        id="regPassword"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="regConfirmPassword">Confirmar Contraseña:</label>
                    <input
                        type="password"
                        id="regConfirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Registrar</button>
            </form>
            <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a></p>
            {message && <p className={`message ${messageType}`}>{message}</p>}
        </div>
    );
}

export default Register;