import React, { useEffect, useState, useRef } from 'react';
import { generateImage } from '../utils/image_generator';
import { generateImagePrompt } from '../services/imagePromptGenerator';

export const PromptProcessor = ({ conversationSummary }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const generateImageFromSummary = async () => {
      if (conversationSummary) {
        setIsLoading(true);
        try {
          const imagePrompt = await generateImagePrompt(conversationSummary);
          const imageUrl = await generateImage(imagePrompt);
          setGeneratedImages(prevImages => [{ url: imageUrl, key: Date.now() }, ...prevImages]);
        } catch (error) {
          console.error('Error generating image:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    generateImageFromSummary();
  }, [conversationSummary]);

  const handleManualRefresh = async () => {
    if (!isLoading && conversationSummary) {
      await generateImageFromSummary();
    }
  };

  return (
    <div className="generated-images" ref={containerRef}>
      <button onClick={handleManualRefresh} disabled={isLoading}>
        Refresh Image
      </button>
      {isLoading && <div className="loading-indicator">Generating new image...</div>}
      {generatedImages.map(image => (
        <div key={image.key} className="generated-image">
          <img src={image.url} alt="Generated from conversation" />
        </div>
      ))}
    </div>
  );
};
