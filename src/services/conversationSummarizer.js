import { generateSummary } from './summaryService.js';

/**
 * Conversation Summarizer Service
 * 
 * This service takes the entire conversation history and the latest dialogue,
 * then generates an updated summary if there are significant changes.
 */
export class ConversationSummarizer {
  constructor() {
    this.currentSummary = '';
  }

  /**
   * Updates the conversation summary based on the latest dialogue.
   * @param {Array} conversationHistory - Array of conversation items.
   * @param {string} latestDialogue - The latest user or assistant message.
   * @returns {Promise<string>} - The updated summary.
   */
  async updateSummary(conversationHistory, latestDialogue) {
    const fullText = conversationHistory
      .map(item => item.formatted.text || item.formatted.transcript)
      .join('\n');

    const newSummary = await generateSummary(fullText);

    if (this.currentSummary !== newSummary) {
      this.currentSummary = newSummary;
      return this.currentSummary;
    }

    return null;
  }
}
