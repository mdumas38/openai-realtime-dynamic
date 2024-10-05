import React, { useState, useEffect } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

interface ContextTrackerProps {
  client: RealtimeClient;
  onContextUpdate: (summary: string) => void;
}

export const ContextTracker: React.FC<ContextTrackerProps> = ({ client, onContextUpdate }) => {
  const [conversationSummary, setConversationSummary] = useState<string>('');

  useEffect(() => {
    const updateSummary = async () => {
      const items = client.conversation.getItems();
      const conversationText = items
        .map((item) => `${item.role}: ${item.formatted.text || item.formatted.transcript}`)
        .join('\n');

      const summary = await generateSummary(conversationText);
      setConversationSummary(summary);
      onContextUpdate(summary);
      
      // Log the updated conversation summary
      console.log('Updated Conversation Summary:', summary);
    };

    client.on('conversation.updated', updateSummary);

    return () => {
      client.off('conversation.updated', updateSummary);
    };
  }, [client, onContextUpdate]);

  const generateSummary = async (conversationText: string) => {
    // Here, you would typically call an API to generate a summary
    // For this example, we'll use a placeholder function
    // In a real implementation, you might want to use OpenAI's API or another summarization service
    return `Summary of conversation: ${conversationText.slice(0, 100)}...`;
  };

  return (
    <div className="context-tracker">
      <h3>Conversation Summary</h3>
      <p>{conversationSummary}</p>
    </div>
  );
};
