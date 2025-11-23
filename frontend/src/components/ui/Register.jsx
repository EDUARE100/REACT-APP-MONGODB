import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import '../../styles/LoginRegister.css';

/**
 * Componente funcional que renderiza la pantalla de inicio de sesión.
 * @returns {JSX.Element} El formulario de inicio de sesión.
 */
export const RegisterScreen = ({onSuccessRedirect}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [showconfirmPassword, setshowconfirmpassword] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {  
    // Forzar overflow-y: hidden con !important temporalmente, para evitar scrolear
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

  const toggleConfirmPasswordVisibility = () =>{
    setshowconfirmpassword(!showconfirmPassword);
  };
  

  const handleCreateAccount = () => {
    if(!firstname || !lastname ||!email ||!username ||!password ||!confirmpassword){
        setMessage({
            title: "Error de validación",
            description: "Completa todos los campos",
            isError: true,
        });
    }
    if(password !== confirmpassword){
        setMessage({
            title: "Error de validación",
            description: "Las contraseñas no coinciden",
            isError: true,
        });
    }

    setMessage({
        title: "Registro Exitoso",
        isError: false,
    })

    setTimeout(() => {
       if(onSuccessRedirect){
            onSuccessRedirect();
       }
    }, 1500);
  };



  return (
    <div className="login-container">
      {/* Tarjeta de Login */}
      <div className="login-card">
        <h1 className="title">Bienvenido</h1>
        <p className="subtitle">Registrate!</p>

        <div className='form-group' style={{margin: "0px", marginBottom: '-10px'}}>
            <label htmlFor="firstname" className='form-label'>
            </label>
            <input 
                id="firstname"
                type="text"
                className="form-input"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="Firstname"
            >
            </input>
        </div>

        <div className='form-group' style={{margin: "0px", marginBottom: '-10px'}}>
            <label htmlFor="lastname" className='form-label'>
            </label>
            <input 
                id="lastname"
                type="text"
                className="form-input"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Lastname"
            >
            </input>
        </div>

        <div className='form-group' style={{margin: "0px", marginBottom: '-10px'}}>
            <label htmlFor="email" className='form-label'>
            </label>
            <input 
                id="email"
                type="text"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            >
            </input>
        </div>

        <div className="form-group" style={{margin: "0px", marginBottom: '-10px'}}>
          <label htmlFor="username" className="form-label">
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
        <div className="form-group" style={{margin: "0px", marginBottom: '-10px'}}>
          <label htmlFor="password" className="form-label">
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

        <div className="form-group" style={{margin: "0px", marginBottom: '-10px'}}>
          <label htmlFor="confirmpassword" className="form-label">
          </label>
          <div className="input-wrapper">
            <input
              id="confirmpassword"
              type={showconfirmPassword ? "text" : "password"}
              className="form-input"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
            />
            <button
              className="password-toggle"
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              aria-label={showconfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showconfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group" style={{width: '70%', marginLeft: '4rem'}}>
          <button
            className="btn btn-primary"
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

export default RegisterScreen;