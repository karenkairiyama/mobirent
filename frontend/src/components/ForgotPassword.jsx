// frontend/src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Para enlaces a otras páginas como login

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Estado para mostrar un spinner/mensaje de carga

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Limpiar mensajes anteriores
        setError('');   // Limpiar errores anteriores
        setLoading(true); // Activar estado de carga

        try {
            // Asegúrate de que la URL apunte a tu backend de Node.js
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(response.data.message); // Muestra el mensaje del backend
            setEmail(''); // Limpiar el campo del email
        } catch (err) {
            // Manejo de errores: el backend debería devolver un mensaje amigable
            setError(err.response?.data?.message || 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false); // Desactivar estado de carga
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Recuperar Contraseña</h2>
            <p>Ingresa tu email para recibir un enlace de restablecimiento.</p>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading} // Deshabilita el botón mientras carga
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>
            </form>

            {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Volver al inicio de sesión</Link>
            </p>
        </div>
    );
}

export default ForgotPassword;