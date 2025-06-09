import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext.jsx'; // Asegúrate de que la ruta sea correcta
import axios from 'axios'; // Importa axios para las peticiones HTTP

// Definimos la URL base de la API usando la variable de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Estilos para el componente ---
const PageContainer = styled.div`
    background-color: #f0f2f5;
    min-height: 100vh;
    padding: 80px 20px 40px;
    box-sizing: border-box;
    color: #333;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const MainContent = styled.div`
    width: 100%;
    max-width: 1000px;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    text-align: center;
`;

const PageTitle = styled.h1`
    font-size: 2.5em;
    color: #007bff;
    margin-bottom: 20px;
`;

const PageSubText = styled.p`
    font-size: 1.1em;
    color: #555;
    margin-bottom: 30px;
`;

const Message = styled.p`
    padding: 10px;
    border-radius: 5px;
    margin-top: 15px;
    text-align: center;
    font-weight: bold;

    &.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    &.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
`;

const BackButton = styled.button`
    margin-top: 30px;
    padding: 10px 20px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #5a6268;
    }
`;

const EmployeeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 40px;
    justify-content: center;
`;

const EmployeeCard = styled.div`
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative; // Para posicionar el toggle

    h3 {
        font-size: 1.6em;
        color: #333;
        margin-bottom: 10px;
    }

    p {
        font-size: 0.95em;
        color: #666;
    }

    strong {
        color: #333;
    }

    .status-tag {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.8em;
        font-weight: bold;
        margin-top: 5px;
        text-transform: uppercase;
        align-self: flex-start;
    }

    &.active .status-tag {
        background-color: #28a745; /* Verde */
        color: white;
    }
    &.inactive .status-tag {
        background-color: #dc3545; /* Rojo */
        color: white;
    }
`;

const StatusToggleContainer = styled.div`
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 10px;

    label {
        font-weight: bold;
        color: #555;
    }
`;

// Estilos para el switch (similar a un toggle de iOS)
const StatusSwitch = styled.label`
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

    input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
        border-radius: 34px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #28a745; /* Color para "Activo" */
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }
`;


function EmployeeManagementPage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true); // Nuevo estado para controlar la carga
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const showMessage = useCallback((msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage(null);
            setMessageType('');
        }, 5000);
    }, []);

    const fetchEmployees = useCallback(async () => {
        if (!currentUser || currentUser.role !== 'admin') {
            showMessage('No tienes permiso para acceder a esta página.', 'error');
            navigate('/');
            return;
        }

        setLoading(true); // Inicia la carga
        const token = localStorage.getItem('token');
        try {
            // Usamos la nueva ruta para obtener solo empleados
            const response = await axios.get(`${API_BASE_URL}/admin/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data);
        } catch (error) {
            console.error('Error al cargar empleados:', error.response?.data?.message || error.message);
            showMessage('Error al cargar la lista de empleados.', 'error');
            setEmployees([]);
        } finally {
            setLoading(false); // Finaliza la carga
        }
    }, [currentUser, navigate, showMessage]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleStatusChange = async (employeeId, currentStatus) => {
        const token = localStorage.getItem('token');
        const newStatus = !currentStatus; // Cambia el estado (true a false, false a true)

        try {
            // Reutilizamos la ruta PUT existente para actualizar el usuario por ID
            const response = await axios.put(`${API_BASE_URL}/admin/users/${employeeId}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Actualizar el estado local de los empleados para reflejar el cambio en la UI
            setEmployees(prevEmployees =>
                prevEmployees.map(emp =>
                    emp._id === employeeId ? { ...emp, status: response.data.status } : emp
                )
            );
            showMessage(`Estado de ${response.data.username} actualizado a ${newStatus ? 'Activo' : 'Inactivo'}.`, 'success');

        } catch (error) {
            console.error('Error al actualizar el estado del empleado:', error.response?.data?.message || error.message);
            showMessage(`Error al actualizar el estado: ${error.response?.data?.message || 'Error desconocido'}.`, 'error');
        }
    };

    const handleGoBack = () => {
        navigate('/admin/dashboard'); // Puedes cambiar esta ruta a donde quieras que regrese el admin
    };

    if (loading) {
        return (
            <PageContainer>
                <MainContent>
                    <PageTitle>Cargando Empleados...</PageTitle>
                    <PageSubText>Por favor, espera.</PageSubText>
                </MainContent>
            </PageContainer>
        );
    }

    // Seguridad adicional si el rol no es admin (aunque AdminRoute ya lo manejaría)
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <PageContainer>
                <MainContent>
                    <PageTitle>Acceso Denegado</PageTitle>
                    <PageSubText>No tienes los permisos necesarios para ver esta página.</PageSubText>
                    <BackButton onClick={() => navigate('/')}>Volver a Inicio</BackButton>
                </MainContent>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <MainContent>
                <PageTitle>Gestión de Empleados</PageTitle>
                <PageSubText>
                    Administra el estado (activo/inactivo) de tus empleados.
                </PageSubText>

                {message && <Message className={messageType}>{message}</Message>}

                <BackButton onClick={handleGoBack}>
                    Volver al Dashboard Admin
                </BackButton>

                <EmployeeGrid>
                    {employees.length > 0 ? (
                        employees.map(employee => (
                            <EmployeeCard key={employee._id} className={employee.status ? 'active' : 'inactive'}>
                                <h3>{employee.username}</h3>
                                <p>Email: <strong>{employee.email}</strong></p>
                                <p>DNI: <strong>{employee.dni || 'N/A'}</strong></p>
                                <p>Fecha de Nacimiento: <strong>{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}</strong></p>
                                {/* Muestra el estado actual con una etiqueta */}
                                <span className="status-tag">
                                    {employee.status ? 'Activo' : 'Inactivo'}
                                </span>

                                <StatusToggleContainer>
                                    <label htmlFor={`status-toggle-${employee._id}`}>Cambiar estado</label>
                                    <StatusSwitch>
                                        <input
                                            type="checkbox"
                                            id={`status-toggle-${employee._id}`}
                                            checked={employee.status}
                                            onChange={() => handleStatusChange(employee._id, employee.status)}
                                        />
                                        <span className="slider round"></span>
                                    </StatusSwitch>
                                </StatusToggleContainer>
                            </EmployeeCard>
                        ))
                    ) : (
                        <PageSubText>No hay empleados registrados.</PageSubText>
                    )}
                </EmployeeGrid>
            </MainContent>
        </PageContainer>
    );
}

export default EmployeeManagementPage;