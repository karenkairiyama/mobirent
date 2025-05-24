import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

function AdminReportsPage() {
    const navigate = useNavigate(); // Inicializa useNavigate

    const handleGoBack = () => {
        navigate('/home'); // Navega a la ruta /home
    };

    return (
        <div className="container">
            <h1>Reportes de Administración</h1>
            <p>Aquí se mostrarán los reportes (solo administradores).</p>
            {/* Botón para volver a Home */}
            <button onClick={handleGoBack} style={{ marginTop: '20px' }}>
                Volver a Home
            </button>
        </div>
    );
}

export default AdminReportsPage;