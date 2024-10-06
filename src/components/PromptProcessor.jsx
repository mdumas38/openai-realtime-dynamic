import React, { useEffect, useState, useRef } from 'react';
import { generateImage } from '../utils/image_generator';

export const PromptProcessor = ({ promptList, conversationSummary }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const generateResponseAndImage = async () => {
      if (promptList.length > 0) {
        const lastPrompt = promptList[promptList.length - 1];
        try {
          console.log('Processing prompt:', lastPrompt);

          // Step 1: Send a POST request to the relay server
          const response = await fetch('http://localhost:8080/api/generate-response', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: lastPrompt, summary: conversationSummary }),
          });

          const data = await response.json();

          if (response.ok) {
            console.log('Generated prompt:', data.response);
            const generatedPrompt = data.response;

            // Step 2: Use the generated prompt to generate an image
            const imageUrl = await generateImage(generatedPrompt);
            console.log('Generated image URL:', imageUrl);

            // Step 3: Append the new image URL to the beginning of the array of generated images
            setGeneratedImages(prevImages => [{ url: imageUrl, key: Date.now() }, ...prevImages]);
          } else {
            console.error('Error from server:', data.error);
          }
        } catch (error) {
          console.error('Error processing prompt:', error);
        }
      }
    };

    generateResponseAndImage();
  }, [promptList, conversationSummary]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [generatedImages]);

  return (
    <div className="generated-images" ref={containerRef}>
      {generatedImages.map(image => (
        <div key={image.key} className="generated-image">
          <img src={image.url} alt="Generated from prompt" />
        </div>
      ))}
    </div>
  );
};