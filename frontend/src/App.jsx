import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Home from './components/Home.jsx';
import LandingPage from './components/LandingPage.jsx'; // Importa el nuevo componente
import './App.css';

function App() {
    // Función para verificar si el usuario está autenticado (con token y username)
    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null && localStorage.getItem('username') !== null;
    };

    return (
        <Router>
            <Routes>
                {/* Ruta para la página de aterrizaje (pública) */}
                <Route path="/" element={<LandingPage />} />

                {/* Rutas de autenticación */}
                <Route path="/login" element={isAuthenticated() ? <Navigate to="/home" replace /> : <Login />} />
                <Route path="/register" element={isAuthenticated() ? <Navigate to="/home" replace /> : <Register />} />

                {/* Ruta para la página principal (protegida) */}
                <Route
                    path="/home"
                    element={isAuthenticated() ? <Home /> : <Navigate to="/login" replace />}
                />

                {/* Cualquier otra ruta no definida redirige a la página principal o login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;