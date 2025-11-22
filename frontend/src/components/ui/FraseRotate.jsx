import RotatingText from "./RotatingText"
import { useState, useEffect } from 'react';
import '../../styles/Fraserotate.css';

function FraseRotate(){
      const [opacity, setOpacity] = useState(0); 
  // Usamos tus tiempos: 1 segundo de retardo, 1 segundo de transición
  const DELAY_MS = 2000; 
  const TRANSITION_DURATION = '2s'; 

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1); 
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, []); 

  return (
    <div 
      className="frase-container"
      style={{
        opacity: opacity, // Aplica el estado de opacidad y la transición
        transition: `opacity ${TRANSITION_DURATION} ease-in-out`,
      }}
    >
    <div className="frase-content">
      <div className="frase-wrapper"> 
        <span className="frase-text">
          ESTO ES PARTE DE
        </span>
      <span className="frase-rotating">
      <RotatingText
        style={{ display: 'inline-block', width: '100%'}}
        texts={['TU IMAGINACIÓN', 'TU CREATIVIDAD', 'TI MISMO']}
        mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
        staggerFrom={"last"}
        initial={{ y: "100%" }}
        animate={{ y: '0' }}
        exit={{ y: "-100%"}}
        staggerDuration={0.025}
        splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        rotationInterval={3000}
      />
      </span>

      </div>
      
      </div>

    </div>
)
}

export default FraseRotate