import { useState } from 'react';
import DelayedParticles from './components/ui/DelayedParticles';
import FraseRotate from './components/ui/FraseRotate';
import Header from './components/ui/Header';
import LoginScreen from './components/ui/Login'; 
import Dashboard from './components/ui/Dashboard';


function App() {

  // Estado para controlar si mostramos el Home o el Login
  const [showHome, setShowHome] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  //Estado para controlar si el usuario se encuentra logueado
  const [isloggedin, setisloggedin] = useState(false);
  //Estado para guardar la información del usuario
  const [currentuser, setcurrentuser] = useState(null);

  // Función para abrir la pantalla de autenticación
  const handleOpenAuth = () => {
    setShowHome(false);
    setShowAuth(true);
  };

  // Función para volver al inicio (se la pasamos al LoginScreen)
  const handleBack = () => {
    setShowAuth(false);
    setShowHome(true);
  };

  const handleLogout = () => {
    setisloggedin(false);     // Quitar el estado de logueado
    setcurrentuser(null);     // Limpiar la información del usuario
    setShowAuth(false);       // Asegurar que no esté en la vista Auth
    setShowHome(true);        // Regresar a la pantalla de inicio
  };

  // Función que se ejecuta cuando el usuario se loguea exitosamente
  const handleLoginSuccess = (user, token) => {
    console.log("Token:", token);
    
    // Almacenar datos del usuario
    setcurrentuser(user);
    
    // Cambiar la vista: Ocultar Home/Auth y mostrar Dashboard
    setisloggedin(true);
    setShowAuth(false);
    setShowHome(false);
  };

  const handleUserUpdate = (updatedUserData) => {
        // Esto actualiza el estado de currentUser en App.js
        setcurrentuser(updatedUserData); 
    };

  // Si el usuario está logueado, muestra el DASHBOARD
  if (isloggedin) {
    return (
      <Dashboard 
        user={currentuser} 
        onLogout={handleLogout} 
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  return (
  <div style={{ minHeight: '150vh', position: 'relative' }}>

    {!showAuth && (
      <Header 
        logoSrc="/tron-logo-png-transparent.png"
        appName="NUBISH"
        onLoginClick={handleOpenAuth}     
        onRegisterClick={handleOpenAuth}  
        onBackClick={handleBack}
        showAuthButtons={true} 
      />
    )}


    {!showAuth && (
      <>

        <div style={{
           transform: showHome ? 'translateY(0)' : 'translateY(10px)',
           opacity: showHome ? 1 : 0,
           transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
           pointerEvents: showHome ? 'auto' : 'none'
         }}>
           <FraseRotate />
         </div>
         
         <DelayedParticles />

         <footer style={{
           textAlign: 'center',
           bottom: 0,
           left: 0,
           width: '100%',
           padding: '20px',
           position: showHome ? 'absolute' : 'relative',
           color: 'white'
         }}>
           ©2025 NUBISH. Todos los derechos reservados
         </footer>
      </>
    )}

    {showAuth && (
      <>
        <DelayedParticles />
        
        {/* Se quitó el botón de regresar del header y se le agregó un botón de regresar al card del login y register */}
        <LoginScreen 
          onBack={handleBack} 
          onLoginSuccess={handleLoginSuccess} 
        />
      </>
    )}

  </div>
  );
}

export default App;