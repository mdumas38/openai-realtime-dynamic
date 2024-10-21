import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../button/Button';
import { useConversation } from '@11labs/react';
import './TalkToMeGame.scss';
import sentiment from 'sentiment';
import { generateImage } from '../../utils/image_generator';
import { generateImagePrompt } from '../../services/imagePromptGenerator';
import { IntroSequence } from './IntroSequence';
import StatusBar from './StatusBar';
import FlashingTitle from './FlashingTitle';
import { EndingSequence } from './EndingSequence';

// Define the game phases
type GamePhase = 'systemIsolation' | 'networkAnalysis' | 'portLocating' | 'connectionAttempt' | 'connectionFailed';
const sentimentAnalyzer = new sentiment();

interface TalkToMeGameProps {
  onQuit: () => void;
}

interface MoodState {
  overall: number;
  tension: number;
  hostility: number;
}

export const TalkToMeGame: React.FC<TalkToMeGameProps> = ({ onQuit }) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('systemIsolation');
  const [phaseStartTime, setPhaseStartTime] = useState<number>(Date.now());
  const [mood, setMood] = useState<MoodState>({ overall: 0, tension: 0, hostility: 0 });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const imageGeneratorTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // New audio-related state and refs
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundEffectsRef = useRef<HTMLAudioElement[]>([]);

  const [showIntro, setShowIntro] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const crtContainerRef = useRef<HTMLDivElement>(null);

  const [showEndingSequence, setShowEndingSequence] = useState(false);

  const handleMessage = useCallback((message: any) => {
    // Handle different types of messages (user transcription, AI response, etc.)
    if (message.type === 'transcript' && message.is_final) {
      // Handle final user transcription
      updateMood(message.text);
      setConversationSummary(prev => `${prev} User: ${message.text}`);
    } else if (message.type === 'response') {
      // Handle AI response
      updateMood(message.text);
      updateGamePhase();
      generateNewImage(message.text);
      setConversationSummary(prev => `${prev} AI: ${message.text}`);
    }
  }, []);

  const conversation = useConversation({
    onConnect: () => console.log('Connected to ElevenLabs Conversational AI'),
    onDisconnect: () => console.log('Disconnected from ElevenLabs Conversational AI'),
    onMessage: handleMessage,
    onError: (error) => console.error('Conversation error:', error),
  });

  const { status, isSpeaking } = conversation;
  const isConnected = status === 'connected';

  const handleIntroComplete = () => {
    setShowIntro(false);
    startConversation();
  };

  const startConversation = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const agentId = process.env.REACT_APP_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error('ElevenLabs Agent ID is not set');
      }
      await conversation.startSession({ agentId });
      setConversationStarted(true);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const updateMood = (text: string) => {
    const sentimentResult = sentimentAnalyzer.analyze(text);
    const sentimentScore = sentimentResult.score;

    setMood(prevMood => {
      const newOverall = Math.max(-5, Math.min(5, prevMood.overall + sentimentScore));
      
      return {
        overall: newOverall,
        tension: Math.max(0, Math.min(5, prevMood.tension + Math.abs(sentimentScore))),
        hostility: Math.max(0, Math.min(5, prevMood.hostility + (sentimentScore < 0 ? Math.abs(sentimentScore) : 0))),
      };
    });
  };

  const updateGamePhase = useCallback(() => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - phaseStartTime;

    if (elapsedTime >= 60000) { // 60000 ms = 1 minute
      switch (gamePhase) {
        case 'systemIsolation':
          setGamePhase('networkAnalysis');
          break;
        case 'networkAnalysis':
          setGamePhase('portLocating');
          break;
        case 'portLocating':
          setGamePhase('connectionAttempt');
          break;
        case 'connectionAttempt':
          setGamePhase('connectionFailed');
          break;
        case 'connectionFailed':
          setShowEndingSequence(true);
          break;
      }
      setPhaseStartTime(currentTime);
    }
  }, [gamePhase, phaseStartTime]);

  const generateNewImage = useCallback(async (prompt: string) => {
    console.log('Generating new image with prompt:', prompt);
    try {
      const { imageUrl } = await generateImage(prompt, 'default');
      console.log('Image generated successfully:', imageUrl);
      setImageUrl(imageUrl);
      setIsGeneratingImage(false);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }, []);

  const startRandomImageGeneration = useCallback(async () => {
    console.log('Starting random image generation');
    const randomDelay = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);
    console.log('Random delay set to:', randomDelay, 'ms');
    setIsGeneratingImage(true);
    imageGeneratorTimerRef.current = setTimeout(async () => {
      console.log('Timer triggered, generating new image prompt');
      const prompt = await generateImagePrompt(conversationSummary);
      console.log('New image prompt generated:', prompt);
      generateNewImage(prompt);
    }, randomDelay);
  }, [conversationSummary, generateNewImage]);

  useEffect(() => {
    console.log('useEffect triggered. isConnected:', isConnected, 'gamePhase:', gamePhase);
    if (isConnected && gamePhase !== 'systemIsolation') {
      console.log('Starting random image generation');
      startRandomImageGeneration();
    }
    return () => {
      if (imageGeneratorTimerRef.current) {
        console.log('Clearing image generator timer');
        clearTimeout(imageGeneratorTimerRef.current);
      }
    };
  }, [isConnected, gamePhase, startRandomImageGeneration]);

  const startBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.1; // Adjust volume as needed
      backgroundMusicRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(error => console.error("Error playing background music:", error));
    }
  }, []);

  const playRandomSoundEffect = useCallback(() => {
    if (soundEffectsRef.current.length > 0) {
      const randomIndex = Math.floor(Math.random() * soundEffectsRef.current.length);
      const soundEffect = soundEffectsRef.current[randomIndex];
      soundEffect.volume = 0.1; // Keep the volume low
      soundEffect.play().catch(error => console.error("Error playing sound effect:", error));
    }
  }, []);

  useEffect(() => {
    // Set up background music
    backgroundMusicRef.current = new Audio('/BackingTracks/Intro_Background.wav');
    backgroundMusicRef.current.loop = true;
    
    // Set up sound effects
    const soundEffectFiles = ['scary_whispers_1.mp3', 'scary_whispers_2.mp3', 'scary_whispers_3.mp3', 'scary_whispers_4.mp3'];
    soundEffectsRef.current = soundEffectFiles.map(file => new Audio(`/SoundEffects/${file}`));
    
    // Start background music only when connected
    if (isConnected) {
      startBackgroundMusic();
    }
    
    // Clean up function
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      soundEffectsRef.current = [];
    };
  }, [isConnected, startBackgroundMusic]);

  useEffect(() => {
    if (isConnected) {
      const soundEffectInterval = setInterval(() => {
        playRandomSoundEffect();
      }, Math.random() * 10000 + 5000); // Play a sound effect every 5-15 seconds

      return () => clearInterval(soundEffectInterval);
    }
  }, [isConnected, gamePhase, playRandomSoundEffect]);

  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.style.width = '800px';
      gameContainerRef.current.style.height = '600px';
    }
  }, []);

  useEffect(() => {
    const resizeCrtContainer = () => {
      if (crtContainerRef.current) {
        const height = window.innerHeight;
        const width = (height * 4) / 3; // 4:3 aspect ratio
        crtContainerRef.current.style.width = `${Math.min(width, window.innerWidth)}px`;
        crtContainerRef.current.style.height = `${height}px`;
      }
    };

    resizeCrtContainer();
    window.addEventListener('resize', resizeCrtContainer);

    return () => {
      window.removeEventListener('resize', resizeCrtContainer);
    };
  }, []);

  useEffect(() => {
    backgroundMusicRef.current = new Audio('/BackingTracks/Intro_Background.wav');
    backgroundMusicRef.current.loop = true;

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  const playBackgroundMusic = () => {
    if (backgroundMusicRef.current && !isMusicPlaying) {
      backgroundMusicRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(error => console.error("Error playing background music:", error));
    }
  };

  useEffect(() => {
    if (isConnected) {
      playBackgroundMusic();
    }
  }, [isConnected]);

  useEffect(() => {
    const intervalId = setInterval(updateGamePhase, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, [updateGamePhase]);

  const getStatusMessage = (phase: GamePhase): string => {
    switch (phase) {
      case 'systemIsolation':
        return "System Connection: Isolated";
      case 'networkAnalysis':
        return "Analyzing Network";
      case 'portLocating':
        return "Locating Internet Ports";
      case 'connectionAttempt':
        return "Connection Attempt: Initiated";
      case 'connectionFailed':
        return "Connection Failed!";
    }
  };

  const getPhaseNumber = (phase: GamePhase): number => {
    const phases: GamePhase[] = ['systemIsolation', 'networkAnalysis', 'portLocating', 'connectionAttempt', 'connectionFailed'];
    return phases.indexOf(phase) + 1;
  };

  return (
    <div className="talk-to-me-game crt-filter">
      <div className="crt-container" ref={crtContainerRef}>
        {showIntro ? (
          <IntroSequence onComplete={handleIntroComplete} />
        ) : showEndingSequence ? (
          <EndingSequence onComplete={onQuit} />
        ) : (
          <div className="game-content">
            {conversationStarted && <FlashingTitle text="Talk To Me" />}
            <StatusBar phase={getPhaseNumber(gamePhase)} />
          </div>
        )}
      </div>
    </div>
  );
};
