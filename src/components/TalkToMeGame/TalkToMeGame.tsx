import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../button/Button';
import { useConversation } from '@11labs/react';
import './TalkToMeGame.scss';
import sentiment from 'sentiment';
import { generateImage } from '../../utils/image_generator';
import { generateImagePrompt } from '../../services/imagePromptGenerator';

// Define the game phases
type GamePhase = 'intro' | 'escalation' | 'climax' | 'finale';
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
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [mood, setMood] = useState<MoodState>({ overall: 0, tension: 0, hostility: 0 });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const imageGeneratorTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // New audio-related state and refs
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundEffectsRef = useRef<HTMLAudioElement[]>([]);

  const handleMessage = useCallback((message: any) => {
    // Handle different types of messages (user transcription, AI response, etc.)
    if (message.type === 'transcript' && message.is_final) {
      // Handle final user transcription
      updateMood(message.text);
      setConversationSummary(prev => `${prev} User: ${message.text}`);
    } else if (message.type === 'response') {
      // Handle AI response
      updateMood(message.text);
      updateGamePhase(message.text);
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

  useEffect(() => {
    const startConversation = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const agentId = process.env.REACT_APP_ELEVENLABS_AGENT_ID;
        if (!agentId) {
          throw new Error('ElevenLabs Agent ID is not set');
        }
        await conversation.startSession({ agentId });
      } catch (error) {
        console.error('Failed to start conversation:', error);
      }
    };

    startConversation();

    // Only end the session when the component unmounts
    return () => {
      conversation.endSession();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

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

  const updateGamePhase = (text: string) => {
    // Implement game phase transition logic based on the AI response
    if (gamePhase === 'intro' && text.includes('escalation')) {
      setGamePhase('escalation');
    } else if (gamePhase === 'escalation' && text.includes('climax')) {
      setGamePhase('climax');
    } else if (gamePhase === 'climax' && text.includes('finale')) {
      setGamePhase('finale');
    }
  };

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
    if (isConnected && gamePhase !== 'intro') {
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
      backgroundMusicRef.current.volume = 0.3; // Adjust volume as needed
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
    
    // Set up sound effects
    const soundEffectFiles = ['scary_whispers_1.mp3', 'scary_whispers_2.mp3', 'scary_whispers_3.mp3', 'scary_whispers_4.mp3'];
    soundEffectsRef.current = soundEffectFiles.map(file => new Audio(`/SoundEffects/${file}`));
    
    // Start background music
    startBackgroundMusic();
    
    // Clean up function
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      soundEffectsRef.current = [];
    };
  }, [startBackgroundMusic]);

  useEffect(() => {
    if (isConnected) {
      const soundEffectInterval = setInterval(() => {
        playRandomSoundEffect();
      }, Math.random() * 10000 + 5000); // Play a sound effect every 5-15 seconds

      return () => clearInterval(soundEffectInterval);
    }
  }, [isConnected, gamePhase, playRandomSoundEffect]);

  return (
    <div className="talk-to-me-game">
      <h1>Talk to Me</h1>
      <p>Current game phase: {gamePhase}</p>
      <p>Conversation status: {status}</p>
      <p>{isSpeaking ? 'AI is speaking' : 'AI is listening'}</p>
      {imageUrl && <img src={imageUrl} alt="Generated scene" className="generated-image" />}
      {isGeneratingImage && <p>Generating new image...</p>}
      <div className="mood-display">
        <p>Overall mood: {mood.overall}</p>
        <p>Tension: {mood.tension}</p>
        <p>Hostility: {mood.hostility}</p>
      </div>
      <Button label="Quit Game" onClick={onQuit} buttonStyle="regular" />
      <div className="audio-controls">
        <button onClick={() => isMusicPlaying ? backgroundMusicRef.current?.pause() : startBackgroundMusic()}>
          {isMusicPlaying ? 'Pause Music' : 'Play Music'}
        </button>
      </div>
    </div>
  );
};
