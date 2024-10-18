import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../button/Button';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from '../../lib/wavtools/index.js';
import { instructions } from '../../utils/conversation_config';
import './TalkToMeGame.scss';

// Define the game phases
type GamePhase = 'intro' | 'escalation' | 'ending';

interface TalkToMeGameProps {
  onQuit: () => void;
}

export const TalkToMeGame: React.FC<TalkToMeGameProps> = ({ onQuit }) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [npcMood, setNpcMood] = useState<'neutral' | 'hostile'>('neutral');
  const [npcImage, setNpcImage] = useState('/path/to/default/npc/image.jpg');
  const [playerInput, setPlayerInput] = useState<string>('');
  const [isListening, setIsListening] = useState(false);

  const clientRef = useRef<RealtimeClient>(new RealtimeClient({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    dangerouslyAllowAPIKeyInBrowser: true
  }));
  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer({ sampleRate: 24000 }));

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
      const timer = setTimeout(() => setGamePhase('escalation'), 120000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'escalation') {
      // Set a timer to transition to ending phase after 3 minutes
      const timer = setTimeout(() => setGamePhase('ending'), 180000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  useEffect(() => {
    // Update NPC image based on game phase and mood
    const updateNpcImage = () => {
      const newImage = `/path/to/${gamePhase}_${npcMood}_image.jpg`;
      setNpcImage(newImage);
    };

    updateNpcImage();

    // Set up a timer to change the NPC image every 2-4 seconds during escalation
    if (gamePhase === 'escalation') {
      const interval = setInterval(() => {
        updateNpcImage();
      }, Math.random() * 2000 + 2000);
      return () => clearInterval(interval);
    }
  }, [gamePhase, npcMood]);

  const connectToGame = async () => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    setIsConnected(true);
    await wavRecorder.begin();
    await wavStreamPlayer.connect();
    await client.connect();

    // Set initial instructions for the TalkToMe game
    client.updateSession({
      instructions: `${instructions}\n\nYou are now the NPC in the TalkToMe horror game. Start with a friendly demeanor but gradually become more unsettling as the game progresses. Your responses should become increasingly eerie and hostile over time.`
    });

    client.sendUserMessageContent([
      {
        type: 'input_text',
        text: 'Welcome to TalkToMe. Are you ready to begin?'
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

  const handleConversationUpdate = async ({ item, delta }: any) => {
    const wavStreamPlayer = wavStreamPlayerRef.current;
    if (delta?.audio) {
      wavStreamPlayer.add16BitPCM(delta.audio, item.id);
    }
    
    // Update playerInput when a user message is received
    if (item.role === 'user' && item.formatted.transcript) {
      setPlayerInput(item.formatted.transcript);
      console.log('Player said:', item.formatted.transcript);
    }

    // Update npcMood based on the conversation
    if (item.role === 'assistant' && item.formatted.text) {
      const text = item.formatted.text.toLowerCase();
      if (text.includes('angry') || text.includes('hostile')) {
        setNpcMood('hostile');
      }
    }
  };

  const renderGameContent = () => {
    switch (gamePhase) {
      case 'intro':
        return <div className="game-phase intro">
          <h2>Welcome to TalkToMe</h2>
          <p>Click on the hand to begin your conversation...</p>
          <img src="/hand.png" alt="Talk to Me" onClick={connectToGame} />
        </div>;
      case 'escalation':
        return <div className="game-phase escalation">
          <h2>The conversation deepens...</h2>
          <img src={npcImage} alt="NPC" className="npc-image" />
          {/* Add more game content here */}
        </div>;
      case 'ending':
        return <div className="game-phase ending">
          <h2>The final moments...</h2>
          {/* Add ending content or jump scare here */}
        </div>;
    }
  };

  return (
    <div className="talk-to-me-game">
      {renderGameContent()}
      {isConnected && (
        <div className="game-controls">
          <Button
            label={isListening ? 'Stop Talking' : 'Start Talking'}
            buttonStyle={isListening ? 'alert' : 'action'}
            onClick={isListening ? stopListening : startListening}
            // onMouseDown={startListening}
            // onMouseUp={stopListening}
          />
          <div className="player-input">
            <p>Player Input: {playerInput}</p>
          </div>
        </div>
      )}
      <Button label="Quit Game" onClick={onQuit} buttonStyle="regular" />
    </div>
  );
};
