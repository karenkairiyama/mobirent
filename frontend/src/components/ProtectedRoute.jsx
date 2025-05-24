import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Componente ProtectedRoute para proteger rutas de React
const ProtectedRoute = ({ allowedRoles = [] }) => {
    const isAuthenticated = localStorage.getItem('token') !== null && localStorage.getItem('username') !== null;
    const userRole = localStorage.getItem('userRole');

    // 1. Si no está autenticado, redirige al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Si está autenticado pero no se especificaron roles O el rol del usuario está permitido
    if (allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole))) {
        return <Outlet />; // Renderiza el componente hijo de la ruta
    }

    // 3. Si está autenticado pero no tiene el rol permitido, redirige a Home (o a una página de "acceso denegado")
    return <Navigate to="/home" replace />;
};

export default ProtectedRoute;