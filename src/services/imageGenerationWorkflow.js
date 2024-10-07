import { generateImage } from '../utils/image_generator.js';
import { generateImagePrompt } from './imagePromptGenerator.js';

/**
 * Image Generation Workflow Service
 * 
 * Generates an image based on the conversation summary.
 */
export class ImageGenerationWorkflow {
  constructor() {}

  /**
   * Initiates the image generation process.
   * @param {string} summary - The current conversation summary.
   * @returns {Promise<string>} - The URL of the generated image.
   */
  async generateImageFromSummary(summary) {
    try {
      // Generate image prompt based on summary
      const imagePrompt = await generateImagePrompt(summary);

      // Generate the image
      const imageUrl = await generateImage(imagePrompt);

      return imageUrl;
    } catch (error) {
      console.error('Error in Image Generation Workflow:', error);
      throw error;
    }
  }
}
