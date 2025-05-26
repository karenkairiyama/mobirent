import React, { useState } from 'react';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dni, setDni] = useState(''); // <-- NUEVO ESTADO PARA DNI
    const [dateOfBirth, setDateOfBirth] = useState(''); // <-- NUEVO ESTADO PARA FECHA DE NACIMIENTO
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        // Validación de campos obligatorios (frontend)
        if (!username || !email || !password || !confirmPassword || !dni || !dateOfBirth) { // <-- VALIDA TODOS LOS CAMPOS
            setMessage('Todos los campos son obligatorios.');
            setMessageType('error');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Las contraseñas no coinciden.');
            setMessageType('error');
            return;
        }

        // Validación de edad mínima (frontend, opcional pero buena práctica)
        const today = new Date();
        const dob = new Date(dateOfBirth);
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 18) { // Mismo límite de edad que en el backend
            setMessage('Debes ser mayor de 18 años para registrarte.');
            setMessageType('error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, dni, dateOfBirth }), // <-- ENVÍA DNI y dateOfBirth
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Registro exitoso. Redirigiendo a login...');
                setMessageType('success');
                // Limpiar formulario
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setDni('');           // Limpia el campo de DNI
                setDateOfBirth('');   // Limpia el campo de fecha de nacimiento
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
                    <label htmlFor="regEmail">Email:</label>
                    <input
                        type="email"
                        id="regEmail"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="regDni">DNI:</label> {/* <-- NUEVO CAMPO DE DNI */}
                    <input
                        type="text" // Usar type="text" para permitir validación de formato más flexible
                        id="regDni"
                        name="dni"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        required
                        pattern="\d{7,9}" // Validación HTML5 para 7 a 9 dígitos numéricos
                        title="El DNI debe contener entre 7 y 9 dígitos numéricos."
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="regDateOfBirth">Fecha de Nacimiento:</label> {/* <-- NUEVO CAMPO DE FECHA */}
                    <input
                        type="date" // Usa type="date" para el selector de fecha del navegador
                        id="regDateOfBirth"
                        name="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                        // min="1900-01-01" // Opcional: limitar fecha mínima
                        max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
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