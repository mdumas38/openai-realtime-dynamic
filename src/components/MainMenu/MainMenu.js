// src/components/MainMenu.js
import React from 'react';
import './MainMenu.scss';

const MainMenu = ({ onStart }) => {
  return (
    <div className="main-menu">
      <h1 className="game-title">DemoDisc #1</h1>
      <p className="powered-by">Powered by UniVerse</p>
      <button className="start-button" onClick={onStart}>Press Start</button>
    </div>
  );
};

export default MainMenu;
