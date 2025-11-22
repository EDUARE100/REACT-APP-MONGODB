import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../../styles/Login.css';

/**
 * Componente funcional que renderiza la pantalla de inicio de sesión.
 * @returns {JSX.Element} El formulario de inicio de sesión.
 */
export const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {  
    // Forzar overflow-y: hidden con !important temporalmente
    document.body.style.setProperty('overflow-y', 'hidden', 'important');
    document.documentElement.style.setProperty('overflow-y', 'hidden', 'important');
  
  // Restaurar cuando se desmonta
  return () => {
    document.body.style.removeProperty('overflow-y');
    document.documentElement.style.removeProperty('overflow-y');
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Manejador de inicio de sesión (simulado)
  const handleLogin = () => {
    if (!username || !password) {
      setMessage({
        title: "Error de Validación",
        description: "Por favor, ingresa tanto el nombre de usuario como la contraseña.",
        isError: true,
      });
      return;
    }

    setMessage({
      title: "Intento de Inicio de Sesión Exitoso",
      description: `¡Hola, ${username}! (Verificación de credenciales simulada)`,
      isError: false,
    });
  };

  const handleCreateAccount = () => {
    setMessage({
      title: "Placeholder de Registro",
      description: "Esto te llevaría a un formulario de registro.",
      isError: false,
    });
  };



  return (
    <div className="login-container">
      {/* Tarjeta de Login */}
      <div className="login-card">
        <h1 className="title">Bienvenido</h1>
        <p className="subtitle">Inicia sesión para acceder a NUBISH.</p>

        {/* Username Input */}
        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Nombre de Usuario
          </label>
          <input
            id="username"
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu nombre de usuario"
          />
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <div className="input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
            <button
              className="password-toggle"
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleLogin}
          >
            Iniciar Sesión
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleCreateAccount}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Mensaje de alerta */}
        {message && (
          <div className="alert-area">
            <div className={`alert-box ${message.isError ? 'alert-error' : 'alert-info'}`}>
              <div>
                <div className="alert-title">{message.title}</div>
                <p className="alert-description">{message.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;