import React, { useEffect, useState, useRef } from 'react';
import { generateImage } from '../utils/image_generator';
import { analyzeImpact } from '../services/impactService';
import { generateSummary } from '../services/summaryService';

export const PromptProcessor = ({ promptList, conversationSummary }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const processPromptAndGenerateImage = async () => {
      if (promptList.length > 0) {
        const lastPrompt = promptList[promptList.length - 1];
        try {
          console.log('Processing prompt:', lastPrompt);

          // Step 1: Get the conversation summary
          const summary = await generateSummary(conversationSummary);

          // Step 2: Analyze the impact of the latest input
          const isSignificantImpact = await analyzeImpact(summary, lastPrompt);

          if (isSignificantImpact) {
            // Step 3: Generate a response if the impact is significant
            const response = await fetch('http://localhost:8080/api/generate-response', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt: lastPrompt, summary: summary }),
            });

            const data = await response.json();

            if (response.ok) {
              console.log('Generated response:', data.response);
              const generatedPrompt = data.response;

              // Step 4: Generate an image based on the response
              const imageUrl = await generateImage(generatedPrompt);
              console.log('Generated image URL:', imageUrl);

              setGeneratedImages(prevImages => [{ url: imageUrl, key: Date.now() }, ...prevImages]);
            } else {
              console.error('Error from server:', data.error);
            }
          } else {
            console.log('No significant impact detected. Skipping response generation.');
          }
        } catch (error) {
          console.error('Error processing prompt:', error);
        }
      }
    };

    processPromptAndGenerateImage();
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