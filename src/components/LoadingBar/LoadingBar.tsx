import React from 'react';

interface LoadingBarProps {
  progress: number; // 0 to 100
}

const LoadingBar: React.FC<LoadingBarProps> = ({ progress }) => {
  return (
    <div className="loading-bar-container">
      <div className="loading-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default LoadingBar;
