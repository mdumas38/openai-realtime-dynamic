import { analyzeImpact } from './impactService.js';

/**
 * Impact Analyzer Service
 * 
 * Determines if the latest input significantly impacts the conversation.
 */
export class ImpactAnalyzer {
  constructor() {
    this.currentState = {};
  }

  /**
   * Analyzes the impact of the latest input.
   * @param {string} summary - The current summary of the conversation.
   * @param {string} latestInput 
   * @returns {Promise<boolean>} - Whether the impact is significant.
   */
  async hasSignificantImpact(summary, latestInput) {
    console.log('Analyzing impact for:', { summary, latestInput });
    const impact = await analyzeImpact(summary, latestInput);
    console.log('Impact analysis result:', impact);
    return impact;
  }
}

