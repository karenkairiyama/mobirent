// frontend/src/pages/ResetPassword.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams(); // Obtiene el token de la URL
  const navigate = useNavigate(); // Hook para redirigir al usuario
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false); // Para mostrar el formulario solo si el token es válido
  const [initialCheckLoading, setInitialCheckLoading] = useState(true); // Para la carga inicial

  useEffect(() => {
    // Opcional: Una comprobación inicial del token si quieres que la página
    // cargue un mensaje de ervor si el token es inválido antes de que el usuario envíe.
    // Por simplicidad, por ahora, el backend lo manejará al enviar el formulario.
    // Si no quieres una llamada inicial, puedes eliminar este useEffect.
    if (!token) {
      setError("No se proporcionó un token de restablecimiento.");
      setInitialCheckLoading(false);
      return;
    }

    // Aquí podrías hacer una petición GET al backend para validar el token
    // antes de mostrar el formulario, pero para simplificar, el backend
    // lo validará cuando se envíe el POST.
    setTokenValidated(true); // Asumimos que el token en la URL es válido por ahora
    setInitialCheckLoading(false);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      // Validación mínima, debe coincidir con el backend
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      // Envía la nueva contraseña y el token al backend
      const response = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { newPassword }
      );
      setMessage(response.data.message);
      // Redirige al usuario al inicio de sesión después de un éxito
      setTimeout(() => {
        navigate("/login");
      }, 3000); // Redirige después de 3 segundos
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al restablecer la contraseña. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialCheckLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>Cargando...</div>
    );
  }

  if (!tokenValidated || error) {
    return (
      <div
        style={{
          maxWidth: "400px",
          margin: "50px auto",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2>Error en el Token</h2>
        <p style={{ color: "red" }}>
          {error ||
            "El token de restablecimiento es inválido o ha expirado. Por favor, solicita uno nuevo."}
        </p>
        <button
          onClick={() => navigate("/forgot-password")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Solicitar un nuevo enlace
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Establecer Nueva Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="newPassword"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Nueva Contraseña:
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="6"
            style={{
              width: "calc(100% - 22px)",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="confirmPassword"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Confirmar Contraseña:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            style={{
              width: "calc(100% - 22px)",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745", // Un color diferente para el botón de restablecer
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Restableciendo..." : "Restablecer Contraseña"}
        </button>
      </form>

      {message && (
        <p style={{ color: "green", marginTop: "15px" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
    </div>
  );
}

export default ResetPassword;
