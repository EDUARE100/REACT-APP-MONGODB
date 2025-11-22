// src/components/ui/Particles.jsx

import { useState, useEffect } from 'react';
// Importa el componente de dibujo base desde el mismo directorio
import Particles from './Particles.jsx'; 

function DelayedParticles() {
  
  const [opacity, setOpacity] = useState(0); 
  // Usamos tus tiempos: 1 segundo de retardo, 1 segundo de transición
  const DELAY_MS = 1000; 
  const TRANSITION_DURATION = '1s'; 

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1); 
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, []); 

  return (
    <div 
      style={{
        width: '100vw',      
        height: '100vh',     
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        zIndex: 0, // Capa de fondo
        
        // Aplica el estado de opacidad y la transición
        opacity: opacity,
        transition: `opacity ${TRANSITION_DURATION} ease-in-out`,
      }}
    >
      <Particles
        // 3. Propiedades de las Partículas (HARCODEADAS AQUÍ PARA SIMPLIFICAR)
        particleColors={['#0047AB', '#ffffff']}
        particleCount={1000}
        particleSpread={25}
        speed={0.1}
        particleBaseSize={200}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
    </div>
  );
}

export default DelayedParticles;