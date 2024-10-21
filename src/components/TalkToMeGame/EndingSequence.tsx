import React, { useState, useEffect } from 'react';
import './EndingSequence.scss';

interface EndingSequenceProps {
  onComplete: () => void;
}

export const EndingSequence: React.FC<EndingSequenceProps> = ({ onComplete }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const endingScript = [
    "Connection lost...",
    "Attempting to reconnect...",
    "Warning: System compromised",
    "Initiating emergency shutdown...",
    "Goodbye, user.",
  ];

  useEffect(() => {
    const audioElement = new Audio('/SoundEffects/ending_sequence.mp3');
    audioElement.play().catch(error => console.error("Error playing audio:", error));

    return () => {
      audioElement.pause();
      audioElement.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (currentLine < endingScript.length) {
      const timer = setTimeout(() => {
        setCurrentLine(currentLine + 1);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(onComplete, 3000);
      return () => clearTimeout(finalTimer);
    }
  }, [currentLine, onComplete]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="ending-sequence">
      {endingScript.slice(0, currentLine + 1).map((line, index) => (
        <div key={index} className="ending-line">
          {line}
          {index === currentLine && (
            <span className={`cursor ${showCursor ? 'visible' : 'hidden'}`}>▋</span>
          )}
        </div>
      ))}
    </div>
  );
};

