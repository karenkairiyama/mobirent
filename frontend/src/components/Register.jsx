import React, { useState } from 'react';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); // <-- NUEVO ESTADO PARA EL EMAIL
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!username || !email || !password || !confirmPassword) { // <-- VALIDA EL EMAIL TAMBIÉN
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
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }), // <-- ENVÍA EL EMAIL
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Registro exitoso. Redirigiendo a login...');
                setMessageType('success');
                setUsername('');
                setEmail(''); // Limpia el campo de email
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
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
                    <label htmlFor="regEmail">Email:</label> {/* <-- NUEVO CAMPO DE EMAIL */}
                    <input
                        type="email" // Usa type="email" para validación básica del navegador
                        id="regEmail"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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