import React, { useState } from 'react';
// import '../App.css'; // Si App.css tiene tus estilos generales

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');

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

        // Simulación de llamada al backend
        console.log('Intentando registrar:', { username, password });

        // Simulación de una respuesta del backend
        // Aquí asumiríamos que el registro fue exitoso para fines de UI
        setMessage('Registro exitoso. Redirigiendo a login...');
        setMessageType('success');
        setTimeout(() => {
            window.location.href = '/login'; // Usaremos React Router en el futuro
        }, 2000);
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
            <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a></p> {/* Usaremos React Router */}
            {message && <p className={`message ${messageType}`}>{message}</p>}
        </div>
    );
}

export default Register;