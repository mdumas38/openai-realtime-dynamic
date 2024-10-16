import React, { useState } from 'react';
import { Button } from '../button/Button';
import './Settings.scss';

interface SettingsProps {
  onBack: () => void;
  initialVolume?: number;
  initialImageGenerator?: string;
  initialUseEnhancer?: boolean;
  onSettingsChange: (settings: {
    volume: number;
    imageGenerator: string;
    useEnhancer: boolean;
  }) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  onBack,
  initialVolume = 50,
  initialImageGenerator = 'default',
  initialUseEnhancer = false,
  onSettingsChange,
}) => {
  const [volume, setVolume] = useState(initialVolume);
  const [imageGenerator, setImageGenerator] = useState(initialImageGenerator);
  const [useEnhancer, setUseEnhancer] = useState(initialUseEnhancer);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(event.target.value, 10);
    setVolume(newVolume);
    updateSettings(newVolume, imageGenerator, useEnhancer);
  };

  const handleImageGeneratorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newImageGenerator = event.target.value;
    setImageGenerator(newImageGenerator);
    updateSettings(volume, newImageGenerator, useEnhancer);
  };

  const handleEnhancerToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUseEnhancer = event.target.checked;
    setUseEnhancer(newUseEnhancer);
    updateSettings(volume, imageGenerator, newUseEnhancer);
  };

  const updateSettings = (
    newVolume: number,
    newImageGenerator: string,
    newUseEnhancer: boolean
  ) => {
    onSettingsChange({
      volume: newVolume,
      imageGenerator: newImageGenerator,
      useEnhancer: newUseEnhancer,
    });
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      
      <div className="setting-item">
        <label htmlFor="volume">Volume: {volume}</label>
        <input
          type="range"
          id="volume"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
      
      <div className="setting-item">
        <label htmlFor="imageGenerator">Image Generator:</label>
        <select
          id="imageGenerator"
          value={imageGenerator}
          onChange={handleImageGeneratorChange}
        >
          <option value="default">Default</option>
          <option value="enhanced">Enhanced</option>
          <option value="artistic">Artistic</option>
        </select>
      </div>
      
      <div className="setting-item">
        <label htmlFor="useEnhancer">
          <input
            type="checkbox"
            id="useEnhancer"
            checked={useEnhancer}
            onChange={handleEnhancerToggle}
          />
          Use Image Enhancer
        </label>
      </div>
      
      <Button label="Back" onClick={onBack} buttonStyle="regular" />
    </div>
  );
};
