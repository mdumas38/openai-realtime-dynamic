import * as fal from '@fal-ai/serverless-client';

// Set up FAL client with your API key
fal.config({
  credentials: '20966859-2b11-4368-80ef-f07f7c3dfe7e:034d9052404b797f91e055d7beaa753e',
});

// Function to generate an image based on a prompt
export async function generateImage(prompt) {
  try {
    // Use the FAL client to generate the image
    const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
      input: {
        prompt: prompt,
        num_images: 1,
        inference_steps: 2,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('Image generated:', result);

    // Get the image URL from the result
    const imageUrl = result.images[0].url;

    // Return the image URL for use in the frontend
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    if (error.body && error.body.detail) {
      console.error('Error details:', JSON.stringify(error.body.detail, null, 2));
    }
    throw error;
  }
}
