import { generateSummary } from './summaryService.js';
import { ImpactAnalyzer } from './impactAnalyzer.js';

/**
 * Conversation Summarizer Service
 * 
 * This service takes the entire conversation history and the latest dialogue,
 * then generates an updated summary if there are significant changes.
 */
export class ConversationSummarizer {
  constructor() {
    this.currentSummary = '';
    this.impactAnalyzer = new ImpactAnalyzer();
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

    // Check if the latest dialogue has a significant impact
    const isSignificant = await this.impactAnalyzer.hasSignificantImpact(this.currentSummary, latestDialogue);

    if (isSignificant) {
      // Generate new summary only if the impact is significant
      const newSummary = await generateSummary(fullText);

      if (this.currentSummary !== newSummary) {
        this.currentSummary = newSummary;
        return this.currentSummary;
      }
    }

    // If no significant change, return null to indicate no update
    return null;
  }
}