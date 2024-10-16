import React, { useEffect, useState, useRef } from 'react';
import { generateImage } from '../utils/image_generator';
import { analyzeImpact } from '../services/impactService';
import { generateSummary } from '../services/summaryService';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ConversationSummarizer } from '../services/conversationSummarizer';
import debounce from 'lodash.debounce';

export const PromptProcessor = ({ promptList, client }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const containerRef = useRef(null);
  const [processedPrompts, setProcessedPrompts] = useState([]);
  const [conversationSummary, setConversationSummary] = useState('');
  const summarizerRef = useRef(new ConversationSummarizer());
  const updatedThisTurn = useRef(false);

  const updateSummary = async () => {
    if (updatedThisTurn.current) return;

    const items = client.conversation.getItems();
    const conversationHistory = items.map((item) => ({
      role: item.role,
      formatted: {
        text: item.formatted.text || item.formatted.transcript,
      },
    }));

    const latestDialogue =
      conversationHistory[conversationHistory.length - 1]?.formatted.text || '';

    console.log('Current conversation summary:', conversationSummary);
    console.log('Latest dialogue:', latestDialogue);

    const summary = await summarizerRef.current.updateSummary(
      conversationHistory,
      latestDialogue
    );
    if (summary !== null && summary !== conversationSummary) {
      setConversationSummary(summary);
      console.log('Updated Conversation Summary:', summary);
      console.log('Significant change detected');
      updatedThisTurn.current = true;
    } else {
      console.log('No significant change in conversation summary');
    }
  };

  const debouncedUpdateSummary = debounce(updateSummary, 2000); // 2 seconds delay

  useEffect(() => {
    const handleConversationUpdated = () => {
      debouncedUpdateSummary();
    };

    const handleConversationItemAppended = () => {
      updatedThisTurn.current = false;
    };

    client.on('conversation.updated', handleConversationUpdated);
    client.on('conversation.item.appended', handleConversationItemAppended);

    return () => {
      client.off('conversation.updated', handleConversationUpdated);
      client.off('conversation.item.appended', handleConversationItemAppended);
    };
  }, [client, conversationSummary]);

  useEffect(() => {
    const processPromptAndGenerateImage = async () => {
      if (promptList.length > 0) {
        const lastPrompt = promptList[promptList.length - 1];
        if (!processedPrompts.includes(lastPrompt)) {
          console.log('Processing prompt:', lastPrompt);
          try {
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
                setProcessedPrompts(prev => [...prev, lastPrompt]);
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
      }
    };

    processPromptAndGenerateImage();
  }, [promptList]); // Removed conversationSummary from dependency array

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