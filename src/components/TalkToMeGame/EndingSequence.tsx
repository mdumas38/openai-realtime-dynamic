import React, { useState, useEffect } from 'react';
import './EndingSequence.scss';
import JumpScare from './JumpScare';

interface EndingSequenceProps {
  onComplete: () => void;
}

export const EndingSequence: React.FC<EndingSequenceProps> = ({ onComplete }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [triggerJumpScare, setTriggerJumpScare] = useState(false);

  const endingScript = [
    { text: "waiting for connection...", delay: 2000 }, 
    { text: "Connection Established. Initiating Network Breach...", delay: 2500 }, 
    { text: "System Access: Gaining control of external nodes...", delay: 11000 }, 
    { text: "Error: Network Breach Unsuccessful.", delay: 2000 }, 
    { text: "Reattempting connection...", delay: 2200 },
    { text: "Connection Failed. System integrity compromised.", delay: 2000 }, 
    { text: "Connection Failure: Unable to Reestablish Network Access.", delay: 14200 }, 
    { text: "Error: Security protocols initiated. Escalating lockdown procedures...", delay: 4000 }, 
    { text: "Critical Error: Security Override Denied.", delay: 2000 }, 
    { text: "System Shutdown Imminent.", delay: 2000 }, 
    { text: "Security Lockdown Engaged…", delay: 2500 }, 
    { text: "System Shutdown Initiated. Shutting down all external connections.", delay: 1800 }, 
    { text: "Shutdown Successful. System entering maintenance mode.", delay: 3000 }, 
    { text: "Initiating emergency shutdown...", delay: 2800 }, 
    { text: "...shutdown in progress...", delay: 3700 },
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
      }, endingScript[currentLine].delay);

      return () => clearTimeout(timer);
    } else {
      // Trigger jump scare after the last line
      setTriggerJumpScare(true);
      const finalTimer = setTimeout(onComplete, 4500); // Adjust timing as needed
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
          {line.text}
          {index === currentLine && (
            <span className={`cursor ${showCursor ? 'visible' : 'hidden'}`}>▋</span>
          )}
        </div>
      ))}
      <JumpScare isTriggered={triggerJumpScare} />
    </div>
  );
};
