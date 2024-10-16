import React from 'react';
import { Button } from '../button/Button';
import './SelectionMenu.scss';

interface SelectionMenuProps {
  onSelectExperience: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

export const SelectionMenu: React.FC<SelectionMenuProps> = ({
  onSelectExperience,
  onSettings,
  onQuit
}) => {
  return (
    <div className="selection-menu">
      <h2>Game Menu</h2>
      <div className="button-container">
        <Button 
          label="Select Experience" 
          onClick={onSelectExperience}
          buttonStyle="action"
        />
        <Button 
          label="Settings" 
          onClick={onSettings}
          buttonStyle="regular"
        />
        <Button 
          label="Quit Game" 
          onClick={onQuit}
          buttonStyle="alert"
        />
      </div>
    </div>
  );
};
