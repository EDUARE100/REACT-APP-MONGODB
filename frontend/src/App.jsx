import DelayedParticles from './components/ui/DelayedParticles';
import FraseRotate from './components/ui/FraseRotate';
import Header from './components/ui/Header';
import { useState } from 'react';
import { LoginScreen } from './components/ui/Login';

function App() {
  const [showContent, setShowContent] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => {
    setShowContent(false);
    setTimeout(() => {
      setShowLogin(true);
    }, 500);
  };

  const handleRegister = () => {
    setShowContent(false);
    setTimeout(() => {
    }, 500);
  };

  const handleback = () => {
    setShowLogin(false);
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
        showAuthButtons={!showLogin}  // ← IMPORTANTE: Esto controla qué botones mostrar
      />
        {!showLogin && (
        <div style={{
          transform: showContent ? 'translateY(0)' : 'translateY(10px)',
          opacity: showContent ? 1 : 0,
          transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
          pointerEvents: showContent ? 'auto' : 'none'
        }}>
          <FraseRotate />
        </div>
        )}

        {!showLogin && <DelayedParticles />}
        {!showLogin && (
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
    </div>
    
  );
}
export default App;

