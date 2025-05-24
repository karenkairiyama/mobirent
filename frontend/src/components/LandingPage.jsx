// frontend/src/components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link

function LandingPage() {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '800px', margin: '50px auto', backgroundColor: '#f0f2f5', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h1>Bienvenido a Nuestra Aplicación de Alquiler de Vehículos</h1>
            <p style={{ fontSize: '1.2em', color: '#555', marginBottom: '30px' }}>
                Tu solución para encontrar y gestionar vehículos de manera eficiente.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                <Link to="/login" className="button">Iniciar Sesión</Link>
                <Link to="/register" className="button secondary">Registrarse</Link>
            </div>

            {/* *********** NUEVO BOTÓN AQUÍ *********** */}
            <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '30px' }}>
                <p style={{ fontSize: '1.1em', color: '#666', marginBottom: '20px' }}>
                    ¿Curioso? Explora nuestra flota disponible sin necesidad de iniciar sesión.
                </p>
                <Link to="/home" className="button">Ver Vehículos Disponibles</Link> {/* Redirige a /home */}
            </div>
        </div>
    );
}

export default LandingPage;