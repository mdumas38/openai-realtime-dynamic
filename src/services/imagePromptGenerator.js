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
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(`Failed to generate image prompt: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    if (!data.imagePrompt) {
      console.error('No image prompt returned from the server');
      return '';
    }
    return data.imagePrompt;
  } catch (error) {
    console.error('Error generating image prompt:', error);
    throw error;
  }
}
