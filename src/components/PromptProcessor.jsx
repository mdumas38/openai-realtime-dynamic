import React, { useEffect, useState, useRef } from 'react';
import { generateImage } from '../utils/image_generator';
import { generateImagePrompt } from '../services/imagePromptGenerator';

export const PromptProcessor = ({ conversationSummary }) => {

  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
    const generateImageFromSummary = async () => {
      if (conversationSummary) {
        setIsLoading(true);
        try {
          const imagePrompt = await generateImagePrompt(conversationSummary);
          const imageUrl = await generateImage(imagePrompt);
          setGeneratedImages(prevImages => [{ url: imageUrl, prompt: imagePrompt, key: Date.now() }, ...prevImages]);
        } catch (error) {
          console.error('Error generating image:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    generateImageFromSummary();
  }, [conversationSummary]);


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