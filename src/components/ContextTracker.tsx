import React, { useState, useEffect, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ConversationSummarizer } from '../services/conversationSummarizer';

interface ContextTrackerProps {
  client: RealtimeClient;
  onContextUpdate: (summary: string) => void;
}

export const ContextTracker: React.FC<ContextTrackerProps> = ({ client, onContextUpdate }) => {
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const summarizer = useRef(new ConversationSummarizer());

  useEffect(() => {
    const updateSummary = async (items: any[]) => {
      const conversationHistory = items.map(item => ({
        role: item.role,
        formatted: {
          text: item.formatted.text || item.formatted.transcript
        }
      }));

      const latestDialogue = conversationHistory[conversationHistory.length - 1]?.formatted.text || '';

      const summary = await summarizer.current.updateSummary(conversationHistory, latestDialogue);
      if (summary !== null && summary !== conversationSummary) {
        setConversationSummary(summary);
        onContextUpdate(summary);
        console.log('Updated Conversation Summary:', summary);
      }
    };

    const handleConversationItemCompleted = ({ item }: any) => {
      if (item.status === 'completed') {
        const items = client.conversation.getItems();
        updateSummary(items);
      }
    };

    client.on('conversation.item.completed', handleConversationItemCompleted);

    return () => {
      client.off('conversation.item.completed', handleConversationItemCompleted);
    };
  }, [client, onContextUpdate, conversationSummary]);

  return (
    <div className="context-tracker">
      <h3>Conversation Summary</h3>
      <p>{conversationSummary}</p>
    </div>
  );
};