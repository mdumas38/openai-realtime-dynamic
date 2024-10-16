import React, { useEffect, useState, useRef } from 'react';
import { generateImage } from '../utils/image_generator';
import { generateImagePrompt } from '../services/imagePromptGenerator';

export const PromptProcessor = ({ conversationSummary, generatorType }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const generateImageFromSummary = async () => {
      if (conversationSummary) {
        setIsLoading(true);
        try {
          const imagePrompt = await generateImagePrompt(conversationSummary);
          const imageUrl = await generateImage(imagePrompt, generatorType);
          setGeneratedImages(prevImages => [{ url: imageUrl, prompt: imagePrompt, key: Date.now() }, ...prevImages]);
        } catch (error) {
          console.error('Error generating image:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    generateImageFromSummary();
  }, [conversationSummary, generatorType]);

  useEffect(() => {
    if (containerRef.current && generatedImages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [generatedImages]);

  return (
    <div className="generated-images" ref={containerRef}>
      {isLoading && <div className="loading-indicator">Generating new image...</div>}
      {generatedImages.map(image => (
        <div key={image.key} className="generated-image-container">
          <div className="generated-image">
            <img src={image.url} alt="Generated from conversation" />
          </div>
          <div className="generated-prompt">
            <h4>Prompt:</h4>
            <p>{image.prompt}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
