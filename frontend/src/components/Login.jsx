import React, { useState } from "react";
// import '../App.css'; // Asegúrate de que tus estilos estén importados
import { useAuth } from "../context/AuthContext.jsx"; // Importa useAuth
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(""); // <--- CAMBIO: Usar 'email' si tu backend lo espera
  const [messageType, setMessageType] = useState("");
  const { login } = useAuth(); // Obtén la función login del contexto

  const handleSubmit = async (e) => {
    // ¡Importante: usa 'async' aquí!
    e.preventDefault();
    setMessage(""); // Limpiar mensajes anteriores
    setMessageType("");

    if (!email || !password) {
      setMessage("Por favor, introduce tu email  y contraseña.");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Parsea la respuesta JSON

      if (response.ok) {
        // Si el login es exitoso, guarda el token, usuario y AHORA EL ROL en el localStorage
        const { token, username, role } = data; // Tu backend debe devolver 'username' y 'role'

        // Llama a la función 'login' del contexto.
        // Esta función se encargará de:
        // 1. Guardar token, username y role en localStorage.
        // 2. Actualizar el estado global de autenticación (isAuthenticated, user).
        // 3. Redirigir a /home.
        login(token, username, role);

        setMessage(data.message || "Inicio de sesión exitoso. Redirigiendo...");
        setMessageType("success");
        // Opcional: limpiar campos
        setUsername("");
        setPassword("");
        setTimeout(() => {
          window.location.href = "/home"; // Redirige a la página principal
        }, 1000);
      } else {
        setMessage(data.message || "Error en el inicio de sesión.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMessage("Ocurrió un error de red o de servidor.");
      setMessageType("error");
    }
  };

  return (
    <div className="container">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>{" "}
          {/* <-- CAMBIO: Etiqueta para 'email' */}
          <input
            type="email" // <-- CAMBIO: Tipo de input a 'email'
            id="email" // <-- CAMBIO: ID a 'email'
            name="email" // <-- CAMBIO: Nombre a 'email'
            value={email} // <-- CAMBIO: Usamos estado 'email'
            onChange={(e) => setEmail(e.target.value)} // <-- CAMBIO: Actualizamos estado 'email'
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
      <p>
        ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
      </p>
      <p>
        ¿Olvidaste tu contraseña?{" "}
        <a href="/forgot-password">Restablecer aquí</a>
      </p>
      {message && <p className={`message ${messageType}`}>{message}</p>}
    </div>
  );
}

export default Login;
