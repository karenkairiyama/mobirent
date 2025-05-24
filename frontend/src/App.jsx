import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import './App.css'; // Aquí puedes importar tus estilos globales

function App() {
    // Función para verificar si el usuario está "autenticado" (por ahora, solo con el username en localStorage)
    const isAuthenticated = () => {
        return localStorage.getItem('username') !== null;
    };

    return (
        <Router>
            <Routes>
                {/* Ruta para el login */}
                <Route path="/login" element={<Login />} />

                {/* Ruta para el registro */}
                <Route path="/register" element={<Register />} />

                {/* Ruta para la página principal (Home) */}
                {/* Protege la ruta 'home' para que solo se acceda si el usuario está autenticado */}
                <Route
                    path="/home"
                    element={isAuthenticated() ? <Home /> : <Navigate to="/login" replace />}
                />

                {/* Ruta por defecto: redirige a /login si no hay una ruta específica o no está autenticado,
                    o a /home si ya está "autenticado" */}
                <Route
                    path="/"
                    element={isAuthenticated() ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;