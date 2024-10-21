import React, { useState, useEffect } from 'react';
import './FlashingTitle.scss';

interface FlashingTitleProps {
  text: string;
}

const FlashingTitle: React.FC<FlashingTitleProps> = ({ text }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length >= 3 ? '' : prevDots + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flashing-title">
      <h1>{text}</h1>
      <h2 className="subtitle">I'm listening<span className="blinking-dots">{dots}</span></h2>
    </div>
  );
};

export default FlashingTitle;
