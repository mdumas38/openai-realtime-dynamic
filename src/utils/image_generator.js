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
export async function generateImage(prompt, generatorType) {
  try {
    let generatorModel = 'fal-ai/flux/schnell'; // default model

    if (generatorType === 'enhanced') {
      generatorModel = 'fal-ai/flux-pro/v1.1';
    } else if (generatorType === 'artistic') {
      generatorModel = 'fal-ai/flux/dev';
    }

    const result = await fal.subscribe(generatorModel, {
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
    console.log('Used generator:', generatorModel);
    const imageUrl = result.images[0].url;
    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}
