import React, { useState, useEffect, useRef } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { ConversationSummarizer } from '../services/conversationSummarizer';

interface ContextTrackerProps {
  client: RealtimeClient;
  onContextUpdate: (summary: string) => void;
}

export const ContextTracker: React.FC<ContextTrackerProps> = ({ client, onContextUpdate }) => {
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const summarizer = new ConversationSummarizer();
  const updatedThisTurn = useRef(false);

  useEffect(() => {
    const updateSummary = async () => {
      if (updatedThisTurn.current) return;

      const items = client.conversation.getItems();
      const conversationHistory = items.map(item => ({
        role: item.role,
        formatted: {
          text: item.formatted.text || item.formatted.transcript
        }
      }));

      const latestDialogue = conversationHistory[conversationHistory.length - 1]?.formatted.text || '';

      const summary = await summarizer.updateSummary(conversationHistory, latestDialogue);
      if (summary !== conversationSummary) {
        setConversationSummary(summary);
        onContextUpdate(summary);
        console.log('Updated Conversation Summary:', summary);
        updatedThisTurn.current = true;
      }
    };

    const handleConversationUpdated = () => {
      updateSummary();
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
  }, [client, onContextUpdate, summarizer, conversationSummary]);

  return (
    <div className="context-tracker">
      <h3>Conversation Summary</h3>
      <p>{conversationSummary}</p>
    </div>
  );
};
