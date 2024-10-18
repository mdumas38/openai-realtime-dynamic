import React, { useEffect, useState, useRef } from 'react';
import { generateImage } from '../utils/image_generator';
import { generateImagePrompt } from '../services/imagePromptGenerator';
import ImageCarousel from './ImageCarousel/ImageCarousel';

export const PromptProcessor = ({ conversationSummary, generatorType }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const generateImageFromSummary = async () => {
      if (conversationSummary) {
        setIsLoading(true);
        try {
          const imagePrompt = await generateImagePrompt(conversationSummary);
          const newImages = [];
          for (let i = 0; i < 4; i++) {
            const { imageUrl, requestId } = await generateImage(imagePrompt, generatorType);
            newImages.push({ url: imageUrl, prompt: imagePrompt, key: requestId });
          }
          setGeneratedImages(prevImages => [...newImages, ...prevImages.slice(0, 16)]);
          setCurrentImageIndex(0);
        } catch (error) {
          console.error('Error generating images:', error);
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
      {isLoading && <div className="loading-indicator">Generating new images...</div>}
      {generatedImages.length > 0 && (
        <ImageCarousel images={generatedImages.slice(0, 4)} />
      )}
    </div>
  );
};
