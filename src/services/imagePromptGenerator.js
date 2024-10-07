import fetch from 'node-fetch';

/**
 * Generates an image prompt based on the conversation summary.
 * @param {string} summary 
 * @returns {Promise<string>} - The image prompt.
 */
export async function generateImagePrompt(summary) {
  try {
    const response = await fetch('http://localhost:8080/api/generate-image-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image prompt');
    }

    const data = await response.json();
    return data.imagePrompt;
  } catch (error) {
    console.error('Error generating image prompt:', error);
    throw error;
  }
}
