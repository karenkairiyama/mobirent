// frontend/src/components/AdminVehicleCreationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';


const PageContainer = styled.div`
    background-color: #f0f2f5;
    min-height: 100vh;
    padding: 80px 20px 40px;
    box-sizing: border-box;
    color: #333;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: center; /* Centra el contenido si no hay sidebar */

    @media (max-width: 768px) {
        flex-direction: column;
        padding-top: 20px;
        align-items: center;
    }
`;

const MainContent = styled.div`
    flex-grow: 1;
    max-width: 900px; /* Limita el ancho del contenido principal para que no se extienda demasiado */
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    text-align: center; /* Centra el texto del título */

    @media (max-width: 768px) {
        padding: 15px;
        margin-top: 20px;
        width: 100%;
    }
`;

const PageTitle = styled.h1`
    font-size: 2.8em;
    color: #007bff;
    margin-bottom: 10px;
    text-align: center;

    @media (max-width: 768px) {
        font-size: 2em;
    }
`;

const PageSubText = styled.p`
    font-size: 1.1em;
    color: #555;
    margin-bottom: 20px;
    text-align: center;

    @media (max-width: 768px) {
        font-size: 0.9em;
    }
`;

const StyledForm = styled.form`
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 30px;
    margin-bottom: 40px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    text-align: left; /* Alinea los labels y inputs a la izquierda dentro del formulario */

    h2 {
        color: #007bff;
        margin-bottom: 25px;
        font-size: 2em;
        text-align: center;
    }
`;

const FormGroup = styled.div`
    margin-bottom: 15px;

    label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #555;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"],
    input[type="url"],
    select {
        width: 100%;
        padding: 12px;
        border: 1px solid #ccc;
        border-radius: 8px;
        font-size: 1em;
        box-sizing: border-box; /* Incluye padding y border en el width */
        transition: border-color 0.3s ease, box-shadow 0.3s ease;

        &:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
            outline: none;
        }
    }

    /* Estilo específico para checkboxes */
    &.checkbox-group {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;

        input[type="checkbox"] {
            width: auto; /* Permite que el checkbox tenga su tamaño natural */
            margin: 0;
            cursor: pointer;
            transform: scale(1.2); /* Agrandar un poco el checkbox */
        }

        label {
            margin-bottom: 0;
            cursor: pointer;
        }
    }
`;

const SubmitButton = styled.button`
    background-color: #28a745;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    width: 100%;
    margin-top: 20px;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: #218838;
        transform: translateY(-2px);
    }

    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;

const Message = styled.p`
    margin-top: 20px;
    padding: 10px 15px;
    border-radius: 5px;
    font-weight: bold;
    text-align: center;

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
    background-color: #6c757d;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    margin-top: 30px;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: #5a6268;
        transform: translateY(-2px);
    }
`;

const BranchInfoMessage = styled.p`
    color: #dc3545; /* Rojo de error */
    font-size: 0.9em;
    margin-top: 5px;
    text-align: center;
    font-weight: bold;
`;



function AdminVehicleCreationPage() {
    // Estados para las propiedades del vehículo
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [type, setType] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [needsMaintenance, setNeedsMaintenance] = useState(false);
    const [capacity, setCapacity] = useState('');
    const [transmission, setTransmission] = useState('');
    const [selectedBranch, setSelectedBranch] = useState(''); // Ahora almacenará el ID de la sucursal
    const [branches, setBranches] = useState([]); // Nuevo estado para almacenar las sucursales cargadas

    // Estados para mensajes de feedback
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();

    // Efecto para cargar las sucursales al montar el componente
    const fetchBranches = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('No autorizado. Por favor, inicia sesión para ver sucursales.');
            setMessageType('error');
            // No redirigimos aquí directamente, permitimos que el formulario se cargue
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/branches', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (response.ok) {
                setBranches(data); // Guarda la lista de sucursales en el estado
                if (data.length > 0) {
                    setSelectedBranch(data[0]._id); // Selecciona la primera sucursal por defecto
                }
            } else {
                setMessage(data.message || 'Error al cargar las sucursales.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al cargar sucursales:', error);
            setMessage('Ocurrió un error de red o de servidor al cargar sucursales.');
            setMessageType('error');
        }
    }, []); // Dependencias vacías para que se ejecute solo una vez al montar

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]); // Depende de fetchBranches (que está memoizada)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!brand || !model || !pricePerDay || !type || !licensePlate || !capacity || !transmission || !selectedBranch) {
            setMessage('Por favor, completa todos los campos obligatorios: marca, modelo, precio por día, tipo, patente, capacidad, caja y sucursal.');
            setMessageType('error');
            return;
        }

        if (isNaN(pricePerDay) || parseFloat(pricePerDay) < 0) {
            setMessage('El precio por día debe ser un número positivo.');
            setMessageType('error');
            return;
        }

        if (isNaN(capacity) || parseInt(capacity) < 1 || parseInt(capacity) > 10) {
            setMessage('La capacidad debe ser un número entre 1 y 10.');
            setMessageType('error');
            return;
        }

        if (!['automatic', 'manual'].includes(transmission)) {
            setMessage('El tipo de caja debe ser "manual" o "automatic".');
            setMessageType('error');
            return;
        }

        if (!['sedan', 'SUV', 'compacto', 'camioneta', 'deportivo', 'furgoneta', 'otro'].includes(type)) {
            setMessage('Tipo de vehículo no válido.');
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
            const response = await fetch('http://localhost:5000/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    brand,
                    model,
                    pricePerDay: parseFloat(pricePerDay),
                    photoUrl,
                    isAvailable,
                    type,
                    licensePlate,
                    needsMaintenance,
                    capacity: parseInt(capacity),
                    transmission,
                    branch: selectedBranch, // Enviamos el ID de la sucursal seleccionada
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Vehículo creado exitosamente.');
                setMessageType('success');
                // Limpiar formulario después de un envío exitoso
                setBrand('');
                setModel('');
                setPricePerDay('');
                setPhotoUrl('');
                setIsAvailable(true);
                setType('');
                setLicensePlate('');
                setNeedsMaintenance(false);
                setCapacity('');
                setTransmission('');
                // selectedBranch se reseteará a la primera opción si hay sucursales
            } else {
                setMessage(data.message || 'Error al crear vehículo.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al crear vehículo:', error);
            setMessage('Ocurrió un error de red o de servidor.');
            setMessageType('error');
        }
    };

    const handleGoBack = () => {
        navigate('/home');
    };

    return (
        <PageContainer>
            <MainContent>
                <PageTitle>Crear Nuevo Vehículo (Admin)</PageTitle>
                <PageSubText>Introduce los detalles del nuevo vehículo para añadirlo a tu flota.</PageSubText>

                <StyledForm onSubmit={handleSubmit}>
                    <FormGroup>
                        <label htmlFor="brand">Marca:</label>
                        <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="model">Modelo:</label>
                        <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="pricePerDay">Precio por Día:</label>
                        <input type="number" id="pricePerDay" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required min="0" step="0.01" />
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="type">Tipo de Vehículo:</label>
                        <select id="type" value={type} onChange={(e) => setType(e.target.value)} required>
                            <option value="">Selecciona un tipo</option>
                            <option value="sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="compacto">Compacto</option>
                            <option value="camioneta">Camioneta</option>
                            <option value="deportivo">Deportivo</option>
                            <option value="furgoneta">Furgoneta</option>
                            <option value="otro">Otro</option>
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="licensePlate">Patente:</label>
                        <input type="text" id="licensePlate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value.toUpperCase())} required maxLength="10" />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="capacity">Capacidad (1-10 personas):</label>
                        <input type="number" id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} required min="1" max="10" />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="transmission">Caja:</label>
                        <select id="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} required>
                            <option value="">Selecciona el tipo de caja</option>
                            <option value="automatic">Automática</option>
                            <option value="manual">Manual</option>
                        </select>
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="branch">Sucursal:</label>
                        <select
                            id="branch"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            required
                            disabled={branches.length === 0}
                        >
                            {branches.length === 0 ? (
                                <option value="">Cargando sucursales...</option>
                            ) : (
                                <>
                                    <option value="">Selecciona una sucursal</option>
                                    {branches.map((branchItem) => (
                                        <option key={branchItem._id} value={branchItem._id}>
                                            {branchItem.name} ({branchItem.address})
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        {branches.length === 0 && !message && (
                            <BranchInfoMessage>
                                No hay sucursales disponibles. Por favor, crea una sucursal primero.
                            </BranchInfoMessage>
                        )}
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="photoUrl">URL de la Foto:</label>
                        <input type="url" id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Ej: https://ejemplo.com/coche.jpg" />
                    </FormGroup>

                    <FormGroup className="checkbox-group">
                        <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                        <label htmlFor="isAvailable">Disponible para Alquilar</label>
                    </FormGroup>
                    <FormGroup className="checkbox-group">
                        <input type="checkbox" id="needsMaintenance" checked={needsMaintenance} onChange={(e) => setNeedsMaintenance(e.target.checked)} />
                        <label htmlFor="needsMaintenance">Necesita Mantenimiento</label>
                    </FormGroup>

                    <SubmitButton type="submit">Crear Vehículo</SubmitButton>
                    {message && <Message className={messageType}>{message}</Message>}
                </StyledForm>

                <BackButton onClick={handleGoBack}>
                    Volver a Home
                </BackButton>
            </MainContent>
        </PageContainer>
    );
}

export default AdminVehicleCreationPage;