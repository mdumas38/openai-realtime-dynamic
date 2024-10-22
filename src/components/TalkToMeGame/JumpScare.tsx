import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './JumpScare.scss'; // We'll create this file for styling

interface JumpScareProps {
  isTriggered: boolean;
  duration?: number;
}

const JumpScare: React.FC<JumpScareProps> = ({ isTriggered, duration = 1000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (isTriggered) {
      setIsVisible(true);
      setFlash(true);

      // Play jump scare sound
      // const audio = new Audio('/assets/jumpscare-sound.mp3');
      // audio.play().catch(error => console.error('Error playing audio:', error));

      // Hide the flash after 100ms
      setTimeout(() => setFlash(false), 100);

      // Hide the scare after the specified duration
      setTimeout(() => setIsVisible(false), duration);
    }
  }, [isTriggered, duration]);

  return (
    <>
      {flash && <div className="flash-overlay" />}
      <motion.div
        className="jump-scare-container"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1.2 : 0.5,
          x: isVisible ? [0, -20, 20, -20, 20, 0] : 0,
        }}
        transition={{
          duration: 0.3,
          x: { type: 'spring', stiffness: 300, damping: 5 },
        }}
      >
        <img src="/assets/scary-image.png" alt="Jump Scare" className="scare-image" />
      </motion.div>
    </>
  );
};

export default JumpScare;
