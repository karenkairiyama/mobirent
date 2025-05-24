import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function EmployeeUserCreationPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!username || !password) {
            setMessage('Por favor, introduce usuario y contraseña.');
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
            // NOTA: La URL aquí es 'employee-users' y el rol NO se envía,
            // ya que el backend lo forzará a 'user' para esta ruta.
            const response = await fetch('http://localhost:5000/api/admin/employee-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ username, password }), // No se envía el rol
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Usuario normal creado exitosamente.');
                setMessageType('success');
                setUsername('');
                setPassword('');
            } else {
                setMessage(data.message || 'Error al crear usuario.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al crear usuario por empleado:', error);
            setMessage('Ocurrió un error de red o de servidor.');
            setMessageType('error');
        }
    };

    const handleGoBack = () => {
        navigate('/home');
    };

    return (
        <div className="container">
            <h1>Cargar Nuevo Usuario (Solo Clientes)</h1>
            <p>Aquí puedes crear cuentas para usuarios con rol 'user'.</p>

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2>Datos del Cliente</h2>
                <div className="form-group">
                    <label htmlFor="employeeUsername">Usuario:</label>
                    <input
                        type="text"
                        id="employeeUsername"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="employeePassword">Contraseña:</label>
                    <input
                        type="password"
                        id="employeePassword"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {/* No hay selección de rol porque siempre será 'user' */}
                <button type="submit">Crear Usuario Cliente</button>
                {message && <p className={`message ${messageType}`}>{message}</p>}
            </form>

            <button onClick={handleGoBack} style={{ marginTop: '30px' }}>
                Volver a Home
            </button>
        </div>
    );
}

export default EmployeeUserCreationPage;