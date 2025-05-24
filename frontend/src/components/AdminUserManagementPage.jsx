import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminUserManagementPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee'); // Por defecto para crear empleados
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [users, setUsers] = useState([]); // Para listar usuarios
    const navigate = useNavigate();

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            } else {
                setMessage(data.message || 'Error al cargar usuarios.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            setMessage('Ocurrió un error de red o de servidor al cargar usuarios.');
            setMessageType('error');
        }
    };

    useEffect(() => {
        fetchUsers(); // Carga los usuarios al montar el componente
    }, []);


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
            const response = await fetch('http://localhost:5000/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Envía el token de admin
                },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Usuario creado exitosamente.');
                setMessageType('success');
                setUsername('');
                setPassword('');
                setRole('employee'); // Resetear al rol por defecto
                fetchUsers(); // Volver a cargar la lista de usuarios
            } else {
                setMessage(data.message || 'Error al crear usuario.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            setMessage('Ocurrió un error de red o de servidor.');
            setMessageType('error');
        }
    };

    const handleGoBack = () => {
        navigate('/home');
    };

    return (
        <div className="container">
            <h1>Gestión de Usuarios (Admin)</h1>
            <p>Aquí puedes crear nuevos usuarios y asignarles roles.</p>

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2>Crear Nuevo Usuario</h2>
                <div className="form-group">
                    <label htmlFor="adminUsername">Usuario:</label>
                    <input
                        type="text"
                        id="adminUsername"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="adminPassword">Contraseña:</label>
                    <input
                        type="password"
                        id="adminPassword"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="adminRole">Rol:</label>
                    <select
                        id="adminRole"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="employee">Empleado</option>
                        <option value="user">Usuario Normal</option>
                        {/* No permitimos al admin crear otros admins desde esta interfaz por seguridad */}
                    </select>
                </div>
                <button type="submit">Crear Usuario</button>
                {message && <p className={`message ${messageType}`}>{message}</p>}
            </form>

            <h2>Usuarios Existentes</h2>
            {users.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {users.map(user => (
                        <li key={user._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{user.username} (Rol: {user.role})</span>
                            {/* Aquí podrías añadir botones para editar o eliminar si implementas esas funcionalidades */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay usuarios registrados (aparte del admin).</p>
            )}

            <button onClick={handleGoBack} style={{ marginTop: '30px' }}>
                Volver a Home
            </button>
        </div>
    );
}

export default AdminUserManagementPage;