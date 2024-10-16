import * as fal from '@fal-ai/serverless-client';

// Set up FAL client with your API key
fal.config({
  credentials: '20966859-2b11-4368-80ef-f07f7c3dfe7e:034d9052404b797f91e055d7beaa753e',
});

let currentImageGenerator = 'default';
let useImageEnhancer = false;

export function setImageGenerator(generator) {
  currentImageGenerator = generator;
}

export function setUseImageEnhancer(useEnhancer) {
  useImageEnhancer = useEnhancer;
}

// Function to generate an image based on a prompt
export async function generateImage(prompt) {
  try {
    // Use the currentImageGenerator and useImageEnhancer variables to adjust the image generation process
    let generatorModel = 'fal-ai/flux-pro/v1.1'; // default model

    if (currentImageGenerator === 'enhanced') {
      generatorModel = 'fal-ai/flux-pro/v2.0'; // example of a different model
    } else if (currentImageGenerator === 'artistic') {
      generatorModel = 'fal-ai/flux-artistic/v1.0'; // example of another model
    }

    // Use the FAL client to generate the image
    const result = await fal.subscribe(generatorModel, {
      input: {
        prompt: prompt,
        num_images: 1,
        inference_steps: useImageEnhancer ? 50 : 30, // Example of using the enhancer setting
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
