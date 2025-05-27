// frontend/src/components/AdminVehicleCreationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminVehicleCreationPage() {
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true); // Estado inicial: disponible
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');

        if (!brand || !model || !pricePerDay) {
            setMessage('Marca, Modelo y Precio por Día son obligatorios.');
            setMessageType('error');
            return;
        }
        if (isNaN(pricePerDay) || parseFloat(pricePerDay) < 0) {
            setMessage('El precio por día debe ser un número positivo.');
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
            const response = await fetch('http://localhost:5000/api/vehicles', { // Ruta POST para crear vehículo
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Envía el token del admin
                },
                body: JSON.stringify({
                    brand,
                    model,
                    pricePerDay: parseFloat(pricePerDay),
                    photoUrl,
                    isAvailable,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Vehículo creado exitosamente.');
                setMessageType('success');
                // Limpiar formulario
                setBrand('');
                setModel('');
                setPricePerDay('');
                setPhotoUrl('');
                setIsAvailable(true); // Resetear a disponible
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
                    <label htmlFor="photoUrl">URL de la Foto:</label>
                    <input type="url" id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="Ej: https://ejemplo.com/coche.jpg" />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="isAvailable" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                    <label htmlFor="isAvailable">Disponible</label>
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