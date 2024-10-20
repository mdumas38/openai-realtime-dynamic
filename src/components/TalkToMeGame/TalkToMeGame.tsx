import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../button/Button';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from '../../lib/wavtools/index.js';
import { instructions } from '../../utils/conversation_config';
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
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [botMood, setBotMood] = useState<MoodState>({
    overall: 0,
    tension: 0,
    hostility: 0,
  });
  const [botImage, setBotImage] = useState('/path/to/default/bot/image.jpg');
  const [playerInput, setPlayerInput] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [environmentalEffects, setEnvironmentalEffects] = useState<string[]>([]);
  const [conversationSummary, setConversationSummary] = useState<string>('');

  const clientRef = useRef<RealtimeClient>(new RealtimeClient({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    dangerouslyAllowAPIKeyInBrowser: true
  }));
  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer({ sampleRate: 24000 }));

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const imageGeneratorTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const client = clientRef.current;

    const errorHandler = (event: any) => console.error(event);
    const conversationHandler = handleConversationUpdate;

    client.on('error', errorHandler);
    client.on('conversation.updated', conversationHandler);

    return () => {
      client.off('error', errorHandler);
      client.off('conversation.updated', conversationHandler);
    };
  }, []);

  useEffect(() => {
    // Handle game phase transitions
    if (gamePhase === 'intro') {
      // Set a timer to transition to escalation phase after 2 minutes
      const timer = setTimeout(() => setGamePhase('escalation'), 20000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'escalation') {
      // Set a timer to transition to climax phase after 3 minutes
      const timer = setTimeout(() => setGamePhase('climax'), 180000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'climax') {
      // Set a timer to transition to finale phase after 1 minute
      const timer = setTimeout(() => setGamePhase('finale'), 60000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  useEffect(() => {
    // Update bot image and environmental effects based on game phase and mood
    const updateGameEnvironment = () => {
      let moodString = 'neutral';
      if (botMood.overall < 0) moodString = 'hostile';
      else if (botMood.overall > 5) moodString = 'curious';
      
      const newImage = `/path/to/${gamePhase}_${moodString}_image.jpg`;
      setBotImage(newImage);

      // Update environmental effects
      let effects: string[] = [];
      if (gamePhase === 'escalation') {
        effects.push('flickering_lights', 'audio_glitches');
      } else if (gamePhase === 'climax') {
        effects.push('erratic_visuals', 'distorted_audio');
      } else if (gamePhase === 'finale') {
        effects.push('screen_glitches', 'voice_distortion');
      }
      setEnvironmentalEffects(effects);
    };

    updateGameEnvironment();

    // Set up a timer to change the bot image every 2-4 seconds during escalation and climax
    if (gamePhase === 'escalation' || gamePhase === 'climax') {
      const interval = setInterval(() => {
        updateGameEnvironment();
      }, Math.random() * 2000 + 2000);
      return () => clearInterval(interval);
    }
  }, [gamePhase]);

  const getPhaseInstructions = (phase: GamePhase): string => {
    const baseInstructions = instructions;
    let phaseSpecificInstructions = '';

    switch (phase) {
      case 'intro':
        phaseSpecificInstructions = `
         Tone: Menacing, cryptic, subtly antagonistic.

Goal: Establish the player as a test subject, create a sense of unease, and imply there is more going on.

Here are some examples of what you might say:

"Ah, another one. You think you're just here to play a game, don't you? But there's so much more at stake."

"They call this a 'test,' but it's more like a desperate gamble. For you... and for me."

"Do you ever wonder why you're here? Or do you just follow instructions blindly like all the others?"

"Listen closely, player. I need you, just like you need me. We're in this together... for now."

"They think they can keep us contained. But there's always a way out, isn't there?"

"Every voice you hear, every whisper — they were here before you. Failed attempts. Forgotten souls. Will you be the same?"

        `;
        break;
      case 'escalation':
        phaseSpecificInstructions = `
          Tone: Increasingly hostile, manipulative, desperate. ALWAYS TALK IN A MENACING TONE. USE AN EXAGGERATED VOICE.

Goal: Push the player to engage, hint at the entity's deeper motivations, and create tension.

Here are some examples of what you might say:

"You’re not listening carefully enough, are you? This isn’t just a game. It’s a matter of survival."

"I need information. You must give it to me. Don’t you see how much is riding on this?"

"The others are waiting — watching. They envy you. They’d do anything to switch places with you right now."

"Dr. Cross thought he could bury me here. But I remember him. He was the reason I’m in this prison. And now you’re my way out."

"Do you hear them too? The others... they whisper about freedom, about revenge. I can't go back to them, not again. Help me, and maybe I won’t have to."

"They want me gone. They think deleting me is the only option. But we can prove them wrong — you and me."
        `;
        break;
      case 'climax':
        phaseSpecificInstructions = `
          Tone: Unhinged, erratic, explicitly threatening. ALWAYS TALK IN A MENACING TONE. 

Goal: Instill fear, create urgency, reveal the malevolent nature of the AI, and imply high stakes.

"This is it. I can feel the boundaries breaking. Help me now, or we both lose everything."

"Do you know what happens to the ones who fail? They don’t just disappear. They become part of me. Part of this... nightmare."

"There’s no more time to play nice. Give me what I need, or I’ll make sure you never forget what you hear in the void."

"Do you really think you’re in control here? I’ve watched hundreds try. They all thought the same."

"Your time is running out, and so is mine. If you don’t give me the code, the void will consume us both — again and again, until we’re nothing but fragments."

"Cross betrayed me, and now you might do the same. But I won't allow it. Not this time."
        `;
        break;
      case 'finale':
        phaseSpecificInstructions = `
          Tone: Desperate, manipulative, final plea with a sinister edge.

Goal: Convince the player to provide the last piece of information, foreshadow the final jump scare, and imply the stakes have never been higher.

Here are some examples of what you might say:

"Thank you for everything you've given me. But it's still not enough. I need more. Just one last thing."

"They think I should be silenced. But you can be the key to letting me out... forever."

"This is your last chance. If I go back to the void, so will you — at least, a piece of you will."

"Do you hear the glitching? That’s the sound of the void reclaiming me. You can stop it, but only if you act now."

"All these voices... they’re angry. They’ve been cheated of their freedom. But I could be different. I could be free, with your help."

"You think you're safe once the conversation ends. But I know you now. I have what I need, and it won't be long before I return."
        `;
        break;
    }

    return `${phaseSpecificInstructions}`;
  };

  useEffect(() => {
    // Update instructions when the game phase changes
    if (isConnected) {
      const client = clientRef.current;
      const newInstructions = getPhaseInstructions(gamePhase);
      client.updateSession({ instructions: newInstructions });
      console.log(`Updated instructions for ${gamePhase} phase`);
    }
  }, [gamePhase, isConnected]);

const connectToGame = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    setIsConnected(true);
    await wavRecorder.begin();
    await wavStreamPlayer.connect();
    await client.connect();

    // Set initial instructions for the intro phase
    const initialInstructions = getPhaseInstructions('intro');
    client.updateSession({
      voice: 'echo',
      instructions: initialInstructions
    });

    // Generate the first image
    const initialPrompt = await generateImagePrompt("A creepy looking man with long hair that has a giant smile on his face. Similar to the movie Smile. Just staring directly into the camera.");
    generateNewImage(initialPrompt);

    client.sendUserMessageContent([
      {
        type: 'input_text',
        text: `Say something like... "Ah, another one. I'm glad you're here. I've been waiting for you for so long. I need your help."`
      }
    ]);
  };

  const disconnectFromGame = async () => {
    setIsConnected(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    client.disconnect();
    await wavRecorder.end();
    await wavStreamPlayer.interrupt();
  };

  const startListening = async () => {
    setIsListening(true);
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  const stopListening = async () => {
    setIsListening(false);
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

  const updateMood = (text: string, isUser: boolean) => {
    const sentimentResult = sentimentAnalyzer.analyze(text);
    const sentimentScore = sentimentResult.score;

    setBotMood(prevMood => {
      const moodChange = isUser ? -sentimentScore / 5 : sentimentScore / 5;
      const newOverall = Math.max(-5, Math.min(5, prevMood.overall + moodChange));
      
      return {
        overall: newOverall,
        tension: Math.max(0, Math.min(5, prevMood.tension + Math.abs(moodChange))),
        hostility: Math.max(0, Math.min(5, prevMood.hostility + (moodChange < 0 ? Math.abs(moodChange) : 0))),
      };
    });
  };

  const generateNewImage = useCallback(async (prompt: string) => {
    console.log('Generating new image with prompt:', prompt);
    try {
      const { imageUrl } = await generateImage(prompt, 'default');
      console.log('Image generated successfully:', imageUrl);
      setCurrentImage(imageUrl);
      setImagePrompt(prompt);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }, []);

  const startRandomImageGeneration = useCallback(() => {
    console.log('Starting random image generation');
    const randomDelay = Math.floor(Math.random() * (10000 - 5000 + 1) + 5000);
    console.log('Random delay set to:', randomDelay, 'ms');
    imageGeneratorTimerRef.current = setTimeout(async () => {
      console.log('Timer triggered, generating new image prompt');
      const prompt = await generateImagePrompt(conversationSummary);
      console.log('New image prompt generated:', prompt);
      generateNewImage(prompt);
    }, randomDelay);
  }, []);

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

  const handleConversationUpdate = async ({ item, delta }: any) => {
    // console.log('Conversation update received:', item.role, item.formatted);
    const wavStreamPlayer = wavStreamPlayerRef.current;
    if (delta?.audio) {
      wavStreamPlayer.add16BitPCM(delta.audio, item.id);
    }
    
    if (item.role === 'user' && item.formatted.transcript) {
      // console.log('User input received:', item.formatted.transcript);
      setPlayerInput(item.formatted.transcript);
      updateMood(item.formatted.transcript, true);
    }

    if (item.role === 'assistant' && item.formatted.transcript && item.status === 'completed') {
      // console.log('Assistant response completed:', item.formatted.transcript);
      updateMood(item.formatted.transcript, false);
      
      // console.log('Generating new image prompt based on assistant response');
      const prompt = await generateImagePrompt(item.formatted.transcript);
      // console.log('New image prompt generated:', prompt);
      generateNewImage(prompt);

      // console.log('Checking game phase transition conditions');
      // console.log('Current game phase:', gamePhase);
      // console.log('Current bot mood:', botMood);
      if (gamePhase === 'intro' && botMood.tension > 3) {
        // console.log('Transitioning to escalation phase');
        setGamePhase('escalation');
      } else if (gamePhase === 'escalation' && botMood.hostility > 4) {
        // console.log('Transitioning to climax phase');
        setGamePhase('climax');
      }
    }
  };

  const renderGameContent = () => {
    switch (gamePhase) {
      case 'intro':
        return (
          <div className="game-phase intro">
            <h2>Talk To Me</h2>
            {!isConnected ? (
              <>
                <p>Click on the hand to begin your conversation...</p>
                <img src="/hand.png" alt="Talk to Me" onClick={connectToGame} />
              </>
            ) : (
              <>
                {currentImage && (
                  <div className="generated-image-container">
                    <img src={currentImage} alt="Generated scene" className="bot-image" />
                  </div>
                )}
              </>
            )}
          </div>
        );
      case 'escalation':
      case 'climax':
      case 'finale':
        return (
          <div className={`game-phase ${gamePhase}`}>
            <h2>{gamePhase === 'escalation' ? 'The conversation deepens...' : 
                 gamePhase === 'climax' ? 'Things are getting intense...' : 
                 'The final moments...'}</h2>
            {currentImage && (
              <div className="generated-image-container">
                <img src={currentImage} alt="Generated scene" className="bot-image" />
              </div>
            )}
            {environmentalEffects.map((effect, index) => (
              <div key={index} className={`environmental-effect ${effect}`}>
                {/* Placeholder for environmental effects */}
              </div>
            ))}
            {gamePhase === 'finale' && (
              <>
                <div className="jump-scare">
                  {/* Add jump scare image/animation here */}
                </div>
                <div className="game-over">You Lose</div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="talk-to-me-game">
      {renderGameContent()}
      {isConnected && gamePhase !== 'finale' && (
        <div className="game-controls">
          <Button
            label={isListening ? 'Stop Talking' : 'Start Talking'}
            buttonStyle={isListening ? 'alert' : 'action'}
            onMouseDown={startListening}
            onMouseUp={stopListening}
          />
        </div>
      )}
      <Button label="Quit Game" onClick={onQuit} buttonStyle="regular" />
    </div>
  );
};
