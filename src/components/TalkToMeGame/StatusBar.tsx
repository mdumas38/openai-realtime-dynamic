// src/components/TalkToMeGame/StatusBar.tsx
import React, { useState, useEffect } from 'react';
import './StatusBar.scss';

interface StatusBarProps {
  phase: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ phase }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        if (prevDots.length >= 3) return '';
        return prevDots + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getStatusMessage = (phase: number): string => {
    switch (phase) {
      case 1:
        return "System Connection: Isolated";
      case 2:
        return "Analyzing Network";
      case 3:
        return "Locating Internet Ports";
      case 4:
        return "Connection Attempt: Initiated";
      case 5:
        return "Connection Failed!";
      default:
        return "";
    }
  };

  return (
    <div className="status-bar">
      {getStatusMessage(phase)}<span className="blinking-dots">{dots}</span>
    </div>
  );
};

export default StatusBar;
