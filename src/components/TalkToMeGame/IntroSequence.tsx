import React, { useState, useEffect, useRef } from 'react';

interface IntroSequenceProps {
  onComplete: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const steps = [
    { text: "Loading Developer: Divine Design...", delay: 2000 },
    { text: "Success.", delay: 2000 },
    { text: "Verifying Subject: 456B71...", delay: 1000 },
    { text: "Verified.", delay: 2000 },
    { text: "Loading Subject: 456B71...", delay: 1000 },
    { text: "Ready.", delay: 1500 },
    { text: "Press ENTER to continue...", delay: 1000 },
  ];

  useEffect(() => {
    audioRef.current = new Audio('/SoundEffects/intro_whirl.mp3');
    audioRef.current.loop = false;

    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      }
    };

    // Delay playing the audio to ensure the component is fully mounted
    const timeoutId = setTimeout(playAudio, 100);

    return () => {
      clearTimeout(timeoutId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setLines(prevLines => [...prevLines, steps[currentStep].text]);
        setCurrentStep(currentStep + 1);
      }, steps[currentStep].delay);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && currentStep === steps.length) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStep, onComplete]);

  return (
    <div className="intro-sequence">
      {lines.map((line, index) => (
        <div key={index} className="intro-line">
          {line}
          {index === lines.length - 1 && index === steps.length - 1 && (
            <span className={`cursor ${showCursor ? 'visible' : 'hidden'}`}>▋</span>
          )}
        </div>
      ))}
    </div>
  );
};
