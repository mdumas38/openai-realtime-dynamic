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

    // Generate new summary
    const newSummary = await generateSummary(fullText);

    // Determine if the summary needs to be updated
    if (this.shouldUpdateSummary(this.currentSummary, newSummary)) {
      this.currentSummary = newSummary;
      return this.currentSummary;
    }

    // If no significant change, return the current summary
    return this.currentSummary;
  }

  /**
   * Determines if the summary should be updated.
   * @param {string} oldSummary 
   * @param {string} newSummary 
   * @returns {boolean}
   */
  shouldUpdateSummary(oldSummary, newSummary) {
    // Simple comparison; can be enhanced with similarity metrics
    return oldSummary !== newSummary;
  }
}