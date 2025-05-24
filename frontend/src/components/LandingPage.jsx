import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link de react-router-dom

function LandingPage() {
    return (
        <div className="container">
            <h1>Bienvenido a Mobirent</h1>
            <p>La mejor solución para tus necesidades de alquiler de coches.</p>
            <div className="button-group">
                {/* Usamos Link para la navegación interna de React */}
                <Link to="/login" className="button">Iniciar Sesión</Link>
                <Link to="/register" className="button secondary">Registrarse</Link>
            </div>
            {/* Opcional: Algún contenido más para la página de aterrizaje */}
            <p style={{ marginTop: '30px', fontSize: '0.9em', color: '#555' }}>
                Explora nuestra plataforma y gestiona tus alquileres de forma sencilla.
            </p>
        </div>
    );
}

export default LandingPage;