import React/*, { useEffect, useState, useCallback } */ from "react";
import { Link /*, useLocation, useNavigate*/ } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext.jsx";

const HomePageContainer = styled.div`
    background-color: #f0f2f5;
    min-height: 100vh;
    padding: 80px 20px 40px;
    box-sizing: border-box;
    color: #333;
    display: flex; // Usamos flexbox para la distribución lateral
    gap: 20px; // Espacio entre el filtro y el contenido principal
    // No usamos justify-content: center aquí para que MainContent ocupe todo el espacio a la derecha
    align-items: flex-start; // Alinea la sidebar y el main content al inicio

    @media (max-width: 768px) {
        flex-direction: column; // Apila los elementos en pantallas pequeñas
        padding-top: 20px;
        align-items: center; // Centra los elementos apilados
    }
`;

const MainContent = styled.div`
    flex-grow: 1; // Permite que el contenido principal ocupe el espacio restante
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    // REMOVED: text-align: center; // Quitamos esto para que el contenido dentro de las tarjetas no se centre por defecto

    @media (max-width: 768px) {
        padding: 15px;
        margin-top: 20px;
        width: 100%; // Asegura que ocupe el 100% en móviles
    }
`;

const WelcomeTitle = styled.h1`
    font-size: 2.8em;
    color: #007bff;
    margin-bottom: 10px;
    text-align: center; // Mantenemos el título centrado

    @media (max-width: 768px) {
        font-size: 2em;
    }
`;

const SubText = styled.p`
    font-size: 1.1em;
    color: #555;
    margin-bottom: 20px;
    text-align: center; // Mantenemos el subtítulo centrado

    @media (max-width: 768px) {
        font-size: 0.9em;
    }
`;

const ButtonGroup = styled.div`
    margin-bottom: 30px;
    display: flex;
    flex-direction: column; // <--- ¡CAMBIO CLAVE AQUÍ! Organiza los ítems en una columna
    align-items: center;    // <--- Centra los ítems horizontalmente en la columna
    gap: 15px;              // <--- Aumenta el espacio entre botones para una mejor separación vertical
    width: 100%;            // <--- Asegura que ocupe todo el ancho disponible para centrar bien
    max-width: 400px;       // <--- Limita el ancho del grupo de botones para que no se estiren demasiado
    margin-left: auto;      // <--- Centra el grupo de botones si tiene un max-width
    margin-right: auto;     // <--- Centra el grupo de botones si tiene un max-width
`;

const ActionButton = styled(Link)`
    background-color: #007bff;
    color: white;
    padding: 18px 25px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 1.2em;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: flex;         /* Usa flex para centrar el contenido del botón */
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 20px;
    width: 100%;           /* Ocupa todo el ancho disponible en la columna */

    &:hover {
        background-color: #0056b3;
        transform: translateY(-3px);
    }
    &:active {
        transform: translateY(0);
    }
    &.secondary {
        background-color: #6c757d;
        &:hover {
            background-color: #5a6268;
        }
    }
`;

const LogoutButton = styled.button`
    background-color: #dc3545;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    margin-top: 10px; // Ajustado para el gap en ButtonGroup
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: #c82333;
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        padding: 10px 20px;
        font-size: 1em;
    }
`;

function PanelControl() {
    const { user, logout } = useAuth();
    // const location = useLocation();
    // const navigate = useNavigate();

    const username = user ? user.username : null;
    const userRole = user ? user.role : null;

const handleLogout = () => {
        logout();
    };

return (
    <HomePageContainer>
        <MainContent>
                {username ? (
                    <>
                        <WelcomeTitle>
                            Bienvenido, <span id="welcomeUsername">{username}</span>!
                        </WelcomeTitle>
                        <SubText>
                            Esta es tu panel de control de {userRole ? userRole.toUpperCase() : 'N/A'}
                        </SubText>
                    </>
                ) : (
                    <>
                        <WelcomeTitle>Explora Nuestra Flota de Vehículos</WelcomeTitle>
                        <SubText>
                            Mira los vehículos disponibles para alquilar. ¡Regístrate o inicia sesión para reservar!
                        </SubText>
                    </>
                )}

                <ButtonGroup>
                    {username ? (
                        <>
                            {(userRole === "employee" || userRole === "admin") && (
                                <ActionButton to="/vehicles-management">
                                    Gestión de Vehículos
                                </ActionButton>
                            )}

                            {/* ESTA HU ES DE LA SRPINT DOS ASIQUE LA OCULTOOOO */}
                            {/*userRole === "employee" && (
                                <ActionButton to="/create-user-as-employee" className="secondary">
                                    Cargar Nuevo Cliente
                                </ActionButton>
                            )*/}

                            {userRole === "admin" && (
                                <>
                                    <ActionButton to="/admin-reports" className="secondary">
                                        Ver Reportes Admin
                                    </ActionButton>
                                    <ActionButton to="/admin-users" className="secondary">
                                        Crear Usuarios
                                    </ActionButton>
                                    <ActionButton to="/admin-create-vehicle" className="secondary">
                                        Crear Nuevo Vehículo
                                    </ActionButton>
                                    <ActionButton to="/admin-employees" className="secondary">
                                        Gestionar Empleados
                                    </ActionButton>
                                </>
                            )}
                            <LogoutButton onClick={handleLogout}>
                                Cerrar Sesión
                            </LogoutButton>
                        </>
                    ) : (
                        <>
                            <ActionButton to="/login">
                                Iniciar Sesión
                            </ActionButton>
                            <ActionButton to="/register" className="secondary">
                                Registrarse
                            </ActionButton>
                        </>
                    )}
                </ButtonGroup>
            </MainContent>
    </HomePageContainer>
    );
}

export default PanelControl;