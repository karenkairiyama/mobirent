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

                {/* Rutas Protegidas (se usa ProtectedRoute) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Home />} /> {/* Home siempre requiere autenticación */}
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
                    <Route path="/vehicles-management" element={<VehicleManagementPage />} />
                    {/* NUEVA RUTA para que empleado/admin puedan crear usuarios 'user' */}
                    <Route path="/create-user-as-employee" element={<EmployeeUserCreationPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin-reports" element={<AdminReportsPage />} />
                    {/* Nueva ruta de gestión de usuarios para el admin */}
                    <Route path="/admin-users" element={<AdminUserManagementPage />} />
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