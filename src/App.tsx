import React, { useState } from 'react';
import { ConsolePage } from './pages/ConsolePage';
import MainMenu from './components/MainMenu/MainMenu';
import { SelectionMenu } from './components/SelectionMenu/SelectionMenu';
import { Settings } from './components/Settings/Settings';
import { ExperienceSelector } from './components/ExperienceSelector/ExperienceSelector';
import { TalkToMeGame } from './components/TalkToMeGame/TalkToMeGame';
import './App.scss';

// Define the possible screen types
type ScreenType = 'mainMenu' | 'selectionMenu' | 'settings' | 'experienceSelector' | 'gameEngine' | 'talkToMeGame';

// Define the settings type
export interface GameSettings {
  volume: number;
  imageGenerator: string;
  useEnhancer: boolean;
}

function App() {
  // Add state to manage which screen is displayed
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('mainMenu');

  // Add state for settings
  const [settings, setSettings] = useState<GameSettings>({
    volume: 50,
    imageGenerator: 'default',
    useEnhancer: false,
  });

  // Add state for selected experience
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);

  // Function to handle navigation
  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  // Function to update settings
  const updateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  // Function to handle experience selection
  const handleExperienceSelect = (experience: string) => {
    setSelectedExperience(experience);
    if (experience === 'Talk To Me') {
      navigateTo('talkToMeGame');
    } else {
      navigateTo('gameEngine');
    }
  };

  // Function to handle quitting the game
  const handleQuitGame = () => {
    setCurrentScreen('mainMenu');
    setSelectedExperience(null); // Reset the selected experience
  };

  // Render the appropriate component based on currentScreen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'mainMenu':
        return <MainMenu onStart={() => navigateTo('selectionMenu')} />;
      case 'selectionMenu':
        return (
          <SelectionMenu
            onSelectExperience={() => navigateTo('experienceSelector')}
            onSettings={() => navigateTo('settings')}
            onQuit={() => navigateTo('mainMenu')}
          />
        );
      case 'settings':
        return (
          <Settings
            onBack={() => navigateTo('selectionMenu')}
            initialVolume={settings.volume}
            initialImageGenerator={settings.imageGenerator}
            initialUseEnhancer={settings.useEnhancer}
            onSettingsChange={updateSettings}
          />
        );
      case 'experienceSelector':
        return (
          <ExperienceSelector
            onSelect={handleExperienceSelect}
            onBack={() => navigateTo('selectionMenu')}
          />
        );
      case 'gameEngine':
        return (
          <ConsolePage 
            settings={settings}
            selectedExperience={selectedExperience}
            onQuit={handleQuitGame}
          />
        );
      case 'talkToMeGame':
        return <TalkToMeGame onQuit={handleQuitGame} />;
      default:
        return <div>Unknown screen</div>;
    }
  };

  return (
    <div data-component="App">
      {renderScreen()}
    </div>
  );
}

export default App;
