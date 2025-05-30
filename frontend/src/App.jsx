import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Home from './components/Home.jsx';
import LandingPage from './components/LandingPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import VehicleManagementPage from './components/VehicleManagementPage.jsx';
import AdminReportsPage from './components/AdminReportsPage.jsx';
import AdminUserManagementPage from './components/AdminUserManagementPage.jsx';
import EmployeeUserCreationPage from './components/EmployeeUserCreationPage.jsx';
import AdminVehicleCreationPage from './components/AdminVehicleCreationPage.jsx'; // Asegúrate de que esta importación esté presente

import ResetPassword from './components/ResetPassword.jsx';
import './App.css';

function App() {
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

                {/* Home siempre requiere autenticación si quieres que se redirija si no hay token */}
                {/* Ojo: Tu Home actual intenta cargar vehículos sin token, lo cual es útil. */}
                {/* Si Home es pública, déjala sin ProtectedRoute. Si es solo para logueados, envuélvela. */}
                {/* Por tu código de Home, parece que debe ser accesible incluso sin loguearse para ver vehículos */}
                <Route path="/home" element={<Home />} />

                {/* Rutas protegidas para 'employee' y 'admin' */}
                <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
                    <Route path="/vehicles-management" element={<VehicleManagementPage />} />
                    {/* NUEVA RUTA para que empleado/admin puedan crear usuarios 'user' */}
                    <Route path="/create-user-as-employee" element={<EmployeeUserCreationPage />} />
                </Route>

                {/* Rutas protegidas EXCLUSIVAS para 'admin' */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin-reports" element={<AdminReportsPage />} />
                    {/* Nueva ruta de gestión de usuarios para el admin */}
                    <Route path="/admin-users" element={<AdminUserManagementPage />} />
                    {/* ****************************************************** */}
                    {/* ¡AQUÍ ESTÁ LA LÍNEA QUE FALTA! */}
                    <Route path="/admin-create-vehicle" element={<AdminVehicleCreationPage />} />
                    {/* ****************************************************** */}
                </Route>

                {/* Rutas protegidas para todos los roles (user, employee, admin) */}
                {/* Puedes combinar estas rutas si su protección es la misma */}
                <Route element={<ProtectedRoute allowedRoles={['user','employee','admin']} />}>
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Route>

                {/* Cualquier otra ruta no definida redirige a la página principal o login */}
                {/* Esta ruta de fallback es la que te estaba llevando a LandingPage */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;