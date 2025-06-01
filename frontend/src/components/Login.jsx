// frontend/src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate para la redirección programática
import styled from "styled-components";
import { useAuth } from "../context/AuthContext.jsx"; // Importa useAuth
// Ya no necesitamos importar loginBackground

// Styled Components
const LoginPageContainer = styled.div`
    // Fondo sin imagen
    width: 100vw;
    height: 100vh;
    background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%); /* Un gradiente azul/morado atractivo */
    // O un color sólido: background-color: #f0f2f5; /* Un gris claro suave */
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;

    // Ya no necesitamos el ::before overlay si el fondo es un color/gradiente simple
    /*
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 0;
    }
    */
`;

const LoginFormWrapper = styled.div`
    background-color: rgba(255, 255, 255, 0.95); /* Fondo casi blanco con ligera transparencia */
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4); /* Sombra más pronunciada */
    text-align: center;
    width: 100%;
    max-width: 400px;
    z-index: 1; // Para que esté encima de cualquier fondo
`;

const Title = styled.h1`
    color: #333;
    margin-bottom: 30px;
    font-size: 2.5em;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FormGroup = styled.div`
    text-align: left;
    margin-bottom: 10px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: bold;
    font-size: 1.1em;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1em;
    box-sizing: border-box;
    transition: border-color 0.3s ease;

    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const SubmitButton = styled.button`
    background-color: #007bff;
    color: white;
    padding: 15px 25px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 20px;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const LinkText = styled.p`
    margin-top: 25px;
    font-size: 0.95em;
    color: #666;

    a {
        color: #007bff;
        text-decoration: none;
        font-weight: bold;
        transition: color 0.2s ease;

        &:hover {
            color: #0056b3;
            text-decoration: underline;
        }
    }
`;

const Message = styled.p`
    margin-top: 20px;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;

    &.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    &.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
`;

function Login() {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");

        if (!email || !password) {
            setMessage("Por favor, introduce tu email y contraseña.");
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

            const data = await response.json();

            if (response.ok) {
                const { token, username, role } = data;
                login(token, username, role);

                setMessage(data.message || "Inicio de sesión exitoso. Redirigiendo...");
                setMessageType("success");
                setPassword("");
                setTimeout(() => {
                    navigate("/home");
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
        <LoginPageContainer>
            <LoginFormWrapper>
                <Title>Iniciar Sesión</Title>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="email">Email:</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="password">Contraseña:</Label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <SubmitButton type="submit">Entrar</SubmitButton>
                </Form>
                <LinkText>
                    ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
                </LinkText>
                <LinkText>
                    ¿Olvidaste tu contraseña?{" "}
                    <a href="/forgot-password">Restablecer aquí</a>
                </LinkText>
                {message && <Message className={messageType}>{message}</Message>}
            </LoginFormWrapper>
        </LoginPageContainer>
    );
}

export default Login;