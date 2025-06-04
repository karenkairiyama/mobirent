// frontend/src/context/AuthContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom"; // Para redireccionar dentro del contexto

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Almacenará { username, role }

  const navigate = useNavigate(); // Hook para redireccionar

  // Función para cargar el estado de autenticación desde localStorage
  const loadAuthState = useCallback(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("userRole");

    if (token && storedUsername && storedRole) {
      setIsAuthenticated(true);
      setUser({ username: storedUsername, role: storedRole });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []); // No hay dependencias porque no usa nada del scope

  // Cargar el estado al inicio
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  // Función para iniciar sesión (la llamarás desde tu componente Login)
  const login = (token, username, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("userRole", role);
    setIsAuthenticated(true);
    setUser({ username, role });
    navigate("/home"); // Redirige a /home después del login
  };

  // Función para cerrar sesión (la llamarás desde Home o Navbar)
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/home"); // Redirige a /login después del logout
    // window.location.reload(); // Opcional: Si persisten problemas, forzar recarga
  };

    const getAuthToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  // El valor que provee el contexto
  const authContextValue = {
    isAuthenticated,
    user, // Puedes acceder a user.username y user.role
    login,
    logout,
    // Recargar el estado si es necesario
    refreshAuthState: loadAuthState,
    getAuthToken, // <-- ¡AÑADE getAuthToken AQUÍ PARA EXPORTARLA!
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
