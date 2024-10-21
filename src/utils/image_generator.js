import { fal } from '@fal-ai/client';

// Set up FAL client with your API key
// fal.config({
//   credentials: process.env.REACT_APP_FAL_API_KEY,
// });

let currentImageGenerator = 'default';
let useImageEnhancer = false;

export function setImageGenerator(generator) {
  currentImageGenerator = generator;
}

export function setUseImageEnhancer(useEnhancer) {
  useImageEnhancer = useEnhancer;
}

// Function to generate an image based on a prompt
export async function generateImage(prompt, generatorType) {
  try {
    let generatorModel = 'fal-ai/flux/schnell'; // default model

    if (generatorType === 'enhanced') {
      generatorModel = 'fal-ai/flux-pro/v1.1';
    } else if (generatorType === 'artistic') {
      generatorModel = 'fal-ai/flux/dev';
    }

    const { data, requestId } = await fal.subscribe(generatorModel, {
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

    console.log('Image generated:', data);
    console.log('Request ID:', requestId);
    console.log('Used generator:', generatorModel);
    return { imageUrl: data.images[0].url, requestId: requestId };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

//example usage
// generateImage('Ro', 'enhanced').then((result) => {
//   console.log('Image generated:', result);
// }).catch((error) => {
//   console.error('Error generating image:', error);
// });

