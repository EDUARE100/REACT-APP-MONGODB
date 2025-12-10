import { useState } from 'react';
import { User, Mail, Lock, Calendar, Eye, EyeOff, AtSign } from 'lucide-react'; 
import '../../styles/Login.css'; //Importamos el diseño del Login

// Conexion IP Local
const BASE_API_URL = 'http://192.168.100.63:3000/api/auth'; 

function LoginScreen({ onBack, onLoginSuccess }) { 
    const [isLogin, setIsLogin] = useState(true);
    
    // Estados
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    
    const [username, setUsername] = useState(""); 

    const [fechaNacimiento, setFechaNacimiento] = useState(""); 
    
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        //Validamos las contraseñas a la hora de hacer el registro
        if (!isLogin && password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        const endpoint = isLogin ? `${BASE_API_URL}/login` : `${BASE_API_URL}/register`;

        const bodyData = isLogin 
            ? { email, password }
            : { 
                nombre: name,
                username: username,
                email, 
                password, 
                fecha_nacimiento: fechaNacimiento 
              };

        try {
            //Creamos la conexión con el backend mediante la variable response que consta de un fetch (Funcion fetch en este caso con el metodo de POST que es Enviar, y el servidor propiamente devuelve una afirmación o negación por protocolo, osea que aunque no sea un método de recibimiento de algún dato en particular, toda método funciona como acción - reacción, osea el protocolo http obliga a mandar una respuesta, await y esperar una respuesta y resolver una Promesa (Promesa es el fetch como tal, se indica querer o esperar recibir algo)). Se envian los datos del endpoint, asi como el método POST y el body que contiene los datos de email, password, y todos los de registro o login enviandolos al backend a que busque los datos en la BD y mandar un mensaje de regreso
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });
            //Lectura de datos dentro del cuerpo del mensaje, en este caso retorna user y token(contraseña encriptada).
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la solicitud');
            }

            if (isLogin) {
                if (onLoginSuccess) {
                    onLoginSuccess(data.user, data.token);
                }
            } else {
                setError("Registro exitoso. Ahora inicia sesión."); 
                setIsLogin(true);
                // Limpiamos lo campos despues del registro
                setPassword("");
                setConfirmPassword("");
                setName("");
                setUsername("");
                setFechaNacimiento("");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Error al conectar con el servidor");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                
                <div className="login-header">
                    <h1 className="login-title">
                        {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                    </h1>
                    <p className="login-subtitle">
                        {isLogin ? 'Inicia sesión para acceder a NUBISH' : 'Únete a nuestra comunidad'}
                    </p>
                </div>

                <div className="login-tabs">
                  {/* El login y register comparten la misma pestaña para que sea más visible la diferencia y no estar constantemente cambiando de pestañas */}
                    <button
                        className={`login-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(true); setError(""); }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`login-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(false); setError(""); }}
                    >
                        Registrarse
                    </button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    
                    {!isLogin && (
                        <>
                            {/* Campo de Nombre */}
                            <div className="form-group">
                                <label className="form-label">Nombre Completo</label>
                                <div className="input-wrapper">
                                    <User className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Tu nombre completo"
                                        className="form-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLogin}
                                    />
                                </div>
                            </div>

                            {/* Campo username */}
                            <div className="form-group">
                                <label className="form-label">Nombre de Usuario</label>
                                <div className="input-wrapper">
                                    <AtSign className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="usuario_unico"
                                        className="form-input"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} // En el campo de username forzamos las minusculas como simple preferencia con toLowerCase()
                                        required={!isLogin}
                                    />
                                </div>
                            </div>

                            {/* Campo de Fecha */}
                            <div className="form-group">
                                <label className="form-label">Fecha de Nacimiento</label>
                                <div className="input-wrapper">
                                    <Calendar className="input-icon" />
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={fechaNacimiento}
                                        onChange={(e) => setFechaNacimiento(e.target.value)}
                                        required={!isLogin}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Campo email */}
                    <div className="form-group">
                        <label className="form-label">
                            {isLogin ? 'Nombre de Usuario o Email' : 'Correo Electrónico'}
                        </label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {/* Campo Contraseña */}
                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="form-input"
                                style={{ paddingRight: '2.5rem' }} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="input-icon-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    {/* Campo Confirmar contraseña */}
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Confirmar Contraseña</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="form-input"
                                    style={{ paddingRight: '2.5rem' }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={!isLogin}
                                />
                                <button
                                    type="button"
                                    className="input-icon-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className={error.includes('exitoso') ? 'success-message' : 'error-message'}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="login-button">
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </button>
                </form>

                <p className="login-footer">
                    Al continuar, aceptas nuestros términos y condiciones
                </p>

                {onBack && (
                    <button onClick={onBack} className="back-button">
                        ← Volver al inicio
                    </button>
                )}
            </div>
        </div>
    );
}

export default LoginScreen;