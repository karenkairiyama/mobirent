// frontend/src/components/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Importa useAuth

function Home() {
  const { isAuthenticated, user, logout } = useAuth(); // Obtén el estado y la función del contexto
  const [vehicles, setVehicles] = useState([]);

  // El username y userRole vienen del objeto 'user' del contexto
  const username = user ? user.username : null;
  const userRole = user ? user.role : null;

  // Este useEffect ahora solo se encarga de cargar vehículos
  useEffect(() => {
    const token = localStorage.getItem("token"); // Obtenemos el token si existe
    fetchAvailableVehicles(token);
  }, []); // Dependencia vacía para que se ejecute solo al montar

  const fetchAvailableVehicles = async (token) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      // Si hay un token, lo incluimos en los headers
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Esta ruta traerá los vehículos que estén 'isAvailable: true' y 'needsMaintenance: false'
      const response = await fetch("http://localhost:5000/api/vehicles", {
        method: "GET",
        headers: headers,
      });

      const data = await response.json();
      if (response.ok) {
        setVehicles(data);
      } else {
        console.error("Error al cargar vehículos:", data.message);
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error de red al cargar vehículos:", error);
      setVehicles([]);
    }
  };

  // handleLogout ahora simplemente llama a la función logout del contexto
  const handleLogout = () => {
    logout(); // Esto se encargará de limpiar localStorage y redirigir a /login
  };

  return (
    <div className="container">
      {/* *********** MODIFICACIÓN CRÍTICA: Contenido condicional para logueados/no logueados *********** */}
      {username ? ( // Si hay un username (está logueado)
        <span>
          <h1>
            Bienvenido, <span id="welcomeUsername">{username}</span>!
          </h1>
          <p>
            Esta es tu página principal. Tu rol es: **{userRole.toUpperCase()}
          </p>
        </span>
      ) : (
        // Si no hay username (no está logueado)
        <span>
          <h1>Explora Nuestra Flota de Vehículos</h1>
          <p>
            Mira los vehículos disponibles para alquilar. ¡Regístrate o inicia
            sesión para reservar!
          </p>
        </span>
      )}

      <div
        className="button-group"
        style={{ flexDirection: "column", gap: "10px" }}
      >
        {username ? ( // Si el usuario está logueado, muestra sus botones de rol
          <>
            {userRole === "employee" || userRole === "admin" ? (
              <Link to="/vehicles-management" className="button">
                Gestión de Vehículos
              </Link>
            ) : null}

            {userRole === "employee" ? (
              <Link to="/create-user-as-employee" className="button secondary">
                Cargar Nuevo Cliente
              </Link>
            ) : null}

            {userRole === "admin" ? (
              <>
                <Link to="/admin-reports" className="button secondary">
                  Ver Reportes Admin
                </Link>
                <Link to="/admin-users" className="button secondary">
                  Gestionar Usuarios
                </Link>
                <Link to="/admin-create-vehicle" className="button secondary">
                  Crear Nuevo Vehículo
                </Link>
              </>
            ) : null}
            <button onClick={handleLogout} style={{ marginTop: "20px" }}>
              Cerrar Sesión
            </button>
          </>
        ) : (
          // Si el usuario NO está logueado, muestra Iniciar Sesión y Registrarse
          <>
            <Link to="/login" className="button">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="button secondary">
              Registrarse
            </Link>
          </>
        )}
      </div>

      {/* Sección para mostrar Vehículos Disponibles (siempre visible en Home) */}
      <div style={{ marginTop: "50px" }}>
        <h2>Vehículos Disponibles para Alquilar:</h2>
        {vehicles.length === 0 ? (
          <p>No hay vehículos disponibles en este momento.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "15px",
                  textAlign: "center",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={
                    vehicle.photoUrl ||
                    "https://via.placeholder.com/150?text=No+Photo"
                  }
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  style={{
                    maxWidth: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                />
                <h3>
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p>Precio por Día: **${vehicle.pricePerDay.toFixed(2)}**</p>
                <p style={{ fontSize: "0.8em", color: "#666" }}>
                  ID: {vehicle.vehicleId}
                </p>
                {/* El botón "Alquilar" se mostrará, pero la funcionalidad real requeriría estar logueado */}
                <button
                  className="button"
                  style={{ width: "100%", marginTop: "10px" }}
                >
                  Alquilar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
