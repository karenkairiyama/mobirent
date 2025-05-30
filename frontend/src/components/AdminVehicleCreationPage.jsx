// frontend/src/components/AdminVehicleCreationPage.jsx
import React, { useState, useEffect } from 'react'; // Importamos useEffect
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Asegúrate de que tus estilos estén importados

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
    useEffect(() => {
        const fetchBranches = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('No autorizado. Por favor, inicia sesión para ver sucursales.');
                setMessageType('error');
                // No redirigimos aquí directamente, permitimos que el formulario se cargue
                return;
            }

            try {
                // Hacemos una solicitud GET a la nueva ruta de sucursales
                const response = await fetch('http://localhost:5000/api/branches', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Envía el token, aunque la ruta GET /api/branches es pública, es buena práctica si en el futuro la proteges
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
        };

        fetchBranches();
    }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        // Validaciones Frontend (BÁSICAS) - Actualizadas para incluir selectedBranch
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
        <div className="container">
            <h1>Crear Nuevo Vehículo (Admin)</h1>
            <p>Introduce los detalles del nuevo vehículo.</p>

            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <div className="form-group">
                    <label htmlFor="brand">Marca:</label>
                    <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="model">Modelo:</label>
                    <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="pricePerDay">Precio por Día:</label>
                    <input type="number" id="pricePerDay" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required min="0" step="0.01" />
                </div>

                <div className="form-group">
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
                </div>
                <div className="form-group">
                    <label htmlFor="licensePlate">Patente:</label>
                    <input type="text" id="licensePlate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value.toUpperCase())} required maxLength="10" />
                </div>
                <div className="form-group">
                    <label htmlFor="capacity">Capacidad (1-10):</label>
                    <input type="number" id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} required min="1" max="10" />
                </div>
                <div className="form-group">
                    <label htmlFor="transmission">Caja:</label>
                    <select id="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)} required>
                        <option value="">Selecciona el tipo de caja</option>
                        <option value="automatic">Automática</option>
                        <option value="manual">Manual</option>
                    </select>
                </div>

                {/* CAMBIO CLAVE AQUÍ: Dropdown para Sucursales */}
                <div className="form-group">
                    <label htmlFor="branch">Sucursal:</label>
                    <select id="branch" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} required disabled={branches.length === 0}>
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
                        <p style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                            No hay sucursales disponibles. Por favor, crea una sucursal primero.
                        </p>
                    )}
                </div>
                {/* Fin del cambio clave */}

                <div className="form-group">
                    <label htmlFor="photoUrl">URL de la Foto:</label>
                    <input type="url" id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Ej: https://ejemplo.com/coche.jpg" />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                    <label htmlFor="isAvailable">Disponible para Alquilar</label>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="needsMaintenance" checked={needsMaintenance} onChange={(e) => setNeedsMaintenance(e.target.checked)} />
                    <label htmlFor="needsMaintenance">Necesita Mantenimiento</label>
                </div>

                <button type="submit">Crear Vehículo</button>
                {message && <p className={`message ${messageType}`}>{message}</p>}
            </form>

            <button onClick={handleGoBack} style={{ marginTop: '30px' }}>
                Volver a Home
            </button>
        </div>
    );
}

export default AdminVehicleCreationPage;