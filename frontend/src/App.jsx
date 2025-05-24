import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Home from './components/Home.jsx';
import LandingPage from './components/LandingPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Importa el ProtectedRoute
import ForgotPassword from './components/ForgotPassword.jsx';

import './App.css';

// Componentes de ejemplo para las nuevas rutas
// Podrías crear archivos separados para estos, pero para el ejemplo los defino aquí
const VehicleManagementPage = () => {
    return (
        <div className="container">
            <h1>Gestión de Vehículos</h1>
            <p>Aquí se gestionarán los vehículos (solo empleados y administradores).</p>
            <Link to="/home">Volver a Home</Link>
        </div>
    );
};

const AdminReportsPage = () => {
    return (
        <div className="container">
            <h1>Reportes de Administración</h1>
            <p>Aquí se mostrarán los reportes (solo administradores).</p>
            <Link to="/home">Volver a Home</Link>
        </div>
    );
};


function App() {
    // Función para verificar si el usuario está autenticado (con token y username)
    // Se mantiene aquí, aunque ProtectedRoute también la usa internamente
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null && localStorage.getItem('username') !== null;
    };

    return (
        <Router>
            <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<LandingPage />} />

                {/* Rutas de Autenticación (redirigen a /home si ya está logueado) */}
                <Route path="/login" element={isAuthenticated() ? <Navigate to="/home" replace /> : <Login />} />
                <Route path="/register" element={isAuthenticated() ? <Navigate to="/home" replace /> : <Register />} />

                {/* Rutas Protegidas (se usa ProtectedRoute) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Home />} /> {/* Home siempre requiere autenticación */}
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
                    <Route path="/vehicles-management" element={<VehicleManagementPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin-reports" element={<AdminReportsPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['user','employee','admin']} />}>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Cualquier otra ruta no definida redirige a la página principal o login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;