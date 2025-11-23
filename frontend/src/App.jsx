import DelayedParticles from './components/ui/DelayedParticles';
import FraseRotate from './components/ui/FraseRotate';
import Header from './components/ui/Header';
import { useState } from 'react';
import { LoginScreen } from './components/ui/Login';
import { RegisterScreen } from './components/ui/Register'

//Funcion Callback para redirigir del registro al login después de crear cuenta

function App() {
  const [showContent, setShowContent] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false)

  const handleLogin = () => {
    setShowContent(false);
    setTimeout(() => {
      setShowLogin(true);
    }, 500);
  };

  const handleRegister = () => {
    setShowContent(false);
    setTimeout(() => {
        setShowRegister(true)
    }, 500);
  };

  const handleRegisterSuccess = () => {
    // 1. Apaga el estado de Registro
    setShowRegister(false); 
    // 2. Enciende el estado de Login
    setShowLogin(true);
  };

  const handleback = () => {
    setShowLogin(false);
    setShowRegister(false);

    setShowContent(false);

    setTimeout(() => {
      setShowContent(true);
    }, 100);
  }



  return (
    <div style={{minHeight: '150vh', position: 'relative'}}>
      <Header 
        logoSrc="/tron-logo-png-transparent.png"
        appName="NUBISH"
        onLoginClick={handleLogin}
        onRegisterClick={handleRegister}
        onBackClick={handleback}
        showAuthButtons={!showLogin && !showRegister}  // ← IMPORTANTE: Esto controla qué botones mostrar
      />
        {!showLogin && !showRegister && (
        <div style={{
          transform: showContent ? 'translateY(0)' : 'translateY(10px)',
          opacity: showContent ? 1 : 0,
          transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
          pointerEvents: showContent ? 'auto' : 'none'
        }}>
          <FraseRotate />
        </div>
        )}

        {!showLogin && !showRegister && <DelayedParticles />}
        {!showLogin && !showRegister && (
        <footer style={{
          textAlign: 'center',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: '20px',
          position: 'absolute',
        }}>
          ©2025 NUBISH.Todos los derechos reservados
        </footer>
        )}
        {showLogin && (
          <>
          <DelayedParticles />
          <LoginScreen />
          </>
        )}
        {showRegister && (
          <>
          <DelayedParticles />
          <RegisterScreen onSuccessRedirect={handleRegisterSuccess}/>
          </>
        )}
    </div>
    
  );
}
export default App;

