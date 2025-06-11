import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Definimos la URL base de la API usando la variable de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_URL; // <--- LÍNEA AÑADIDA

function EmployeeUserCreationPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dni, setDni] = useState(''); 
    const [dateOfBirth, setDateOfBirth] = useState(''); 
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        // Validaciones básicas del frontend
        if (!username || !email || !password || !dni || !dateOfBirth) { 
            setMessage('Todos los campos son obligatorios.');
            setMessageType('error');
            return;
        }

        // Validación de edad mínima (frontend)
        const today = new Date();
        const dob = new Date(dateOfBirth);
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 18) {
            setMessage('El usuario debe ser mayor de 18 años.');
            setMessageType('error');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('No autorizado. Por favor, inicia sesión de nuevo.');
            setMessageType('error');
            navigate('/login');
            return;
        }

        try {
            // MODIFICACIÓN: Usamos la variable de entorno para la URL
            const response = await fetch(`${API_BASE_URL}/admin/create-user`, { // Ruta para crear usuarios (empleado/admin)
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    dni,           
                    dateOfBirth,   
                    role: 'user', 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Cliente creado exitosamente.');
                setMessageType('success');
                // Limpiar formulario
                setUsername('');
                setEmail('');
                setPassword('');
                setDni('');
                setDateOfBirth('');
            } else {
                setMessage(data.message || 'Error al crear cliente.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al crear cliente:', error);
            setMessage('Ocurrió un error de red o de servidor.');
            setMessageType('error');
        }
    };

    const handleGoBack = () => {
        navigate('/panel-de-control');
    };

    return (
        <div className="container">
            <h1>Cargar Nuevo Cliente (Empleado)</h1>
            <p>Introduce los detalles para registrar un nuevo cliente (rol: **USER**).</p>

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <div className="form-group">
                    <label htmlFor="empUsername">Usuario:</label>
                    <input
                        type="text"
                        id="empUsername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="empEmail">Email:</label>
                    <input
                        type="email"
                        id="empEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="empDni">DNI:</label> {/* <-- NUEVO CAMPO DNI */}
                    <input
                        type="text"
                        id="empDni"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        required
                        pattern="\d{7,9}"
                        title="El DNI debe contener entre 7 y 9 dígitos numéricos."
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="empDateOfBirth">Fecha de Nacimiento:</label> {/* <-- NUEVO CAMPO FECHA */}
                    <input
                        type="date"
                        id="empDateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="empPassword">Contraseña Temporal:</label>
                    <input
                        type="password"
                        id="empPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Crear Cliente</button>
                {message && <p className={`message ${messageType}`}>{message}</p>}
            </form>

            <button onClick={handleGoBack} style={{ marginTop: '30px' }}>
                Volver a Panel de Control
            </button>
        </div>
    );
}

export default EmployeeUserCreationPage;