import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx"; // Importa AuthProvider y useAuth
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Home from "./components/Home.jsx";
import LandingPage from "./components/LandingPage.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
//import ProtectedRoute from "./components/ProtectedRoute.jsx";
import VehicleManagementPage from "./components/VehicleManagementPage.jsx";
import AdminReportsPage from "./components/AdminReportsPage.jsx";
import AdminUserManagementPage from "./components/AdminUserManagementPage.jsx";
import EmployeeUserCreationPage from "./components/EmployeeUserCreationPage.jsx";
import AdminVehicleCreationPage from "./components/AdminVehicleCreationPage.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import "./App.css";
import Navbar from "./components/Navbar";

// Componente de Ruta Protegida 29/5 micha
// **ESTA ES LA ÚNICA Y CORRECTA DECLARACIÓN DE ProtectedRoute**
// Se mueve aquí para que pueda usar useAuth directamente,
// y se hace más flexible para roles.
const AppProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth(); // Obtén el user del contexto para el rol
  const userRole = user ? user.role : null;

  // Si no está autenticado, redirige a /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos y el rol del usuario no está entre ellos, redirige
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    // Podrías redirigir a un /unauthorized o simplemente a /home
    return <Navigate to="/" replace />;
  }

  // Si está autenticado y tiene el rol correcto (o no hay restricción de rol)
  return children;
};

// Componente auxiliar para rutas como Login/Register que deben redirigir
// si el usuario ya está autenticado.
const RequireAuthNotLoggedIn = ({ children }) => {
  const { isAuthenticated } = useAuth(); // <--- AQUI ESTABA LA AUSENCIA: Ahora obtenemos isAuthenticated
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  // ELIMINAMOS: const isAuthenticated = () => { ... } 29/5
  // Ya no es necesaria porque usaremos isAuthenticated y user de useAuth();

  return (
    <Router>
      <Navbar />
      <AuthProvider>
        {/* Envuelve tus rutas con el AuthProvider */}
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* La ruta de reset-password NO DEBE ESTAR PROTEGIDA */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />

          {/* Rutas de Autenticación: Si ya está logueado, redirige a /home */}
          <Route
            path="/login"
            element={
              <RequireAuthNotLoggedIn>
                <Login />
              </RequireAuthNotLoggedIn>
            }
          />
          <Route
            path="/register"
            element={
              <RequireAuthNotLoggedIn>
                {" "}
                <Register />{" "}
              </RequireAuthNotLoggedIn>
            }
          />

          {/* Rutas Protegidas que requieren autenticación */}
          <Route
            path="/vehicles-management"
            element={
              <AppProtectedRoute allowedRoles={["employee", "admin"]}>
                <VehicleManagementPage />
              </AppProtectedRoute>
            }
          />
          {/* NUEVA RUTA para que empleado/admin puedan crear usuarios 'user' */}
          <Route
            path="/create-user-as-employee"
            element={
              <AppProtectedRoute allowedRoles={["employee", "admin"]}>
                <EmployeeUserCreationPage />
              </AppProtectedRoute>
            }
          />

          {/* Rutas Protegidas para Admin */}
          <Route
            path="/admin-reports"
            element={
              <AppProtectedRoute allowedRoles={["admin"]}>
                <AdminReportsPage />
              </AppProtectedRoute>
            }
          />
          {/* Nueva ruta de gestión de usuarios para el admin */}
          <Route
            path="/admin-users"
            element={
              <AppProtectedRoute allowedRoles={["admin"]}>
                <AdminUserManagementPage />
              </AppProtectedRoute>
            }
          />
          <Route
            path="/admin-create-vehicle"
            element={
              <AppProtectedRoute allowedRoles={["admin"]}>
                <AdminVehicleCreationPage />
              </AppProtectedRoute>
            }
          />

          {/* Ruta Catch-all: Cualquier otra ruta no definida redirige a la página principal (Home) */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
