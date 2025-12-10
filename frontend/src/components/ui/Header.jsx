import StarBorder from './Starborderbutton';
import '../../styles/Header.css';

function Header({ logoSrc, appName, onLoginClick, onRegisterClick, onBackClick, showAuthButtons = true }) {
  
  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleRegister = () => {
    if (onRegisterClick) {
      onRegisterClick();
    }
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo y nombre a la izquierda */}
        <div className="brand">
          {logoSrc && (
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="brand-logo"
            />
          )}
          <h1 className="brand-name">{appName}</h1>
        </div>
        
        {/* Botones a la derecha */}
        <div className="header-button-group">
          {showAuthButtons ? (
          <>
          <StarBorder
            color="#0047AB"
            speed="4s"
            thickness={1.5}
            onClick={handleLogin}
          >
            Comenzar
          </StarBorder>
  
          </>
          ):(
            <StarBorder
              color='#0047AB'
              speed="4s"
              thickness={1.5}
              onClick={handleBack}
            >
              ← Volver
            </StarBorder>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;