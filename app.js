import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getPromptList } from './utils/promptHandler';
// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

// Function to generate responses for prompts
export async function generateResponse(promptList) {
    const responses = [];

    for (const prompt of promptList) {
        try {
            console.log('Processing prompt:', prompt);

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an intelligent and helpful assistant. Your primary role is to take spoken dialogue from users and translate it into highly detailed and descriptive prompts. These prompts are formatted specifically for MidJourney, an image generation API, to create visually compelling and unique artwork based on the user’s input. You respond clearly, ensuring the prompts you generate capture the user’s vision with precision and creativity. Do not include any language in the response other than the prompt exactly how it should be input into Midjourney. Do not include '/imagine' or any other command, just the prompt.`,
                    },
                    { role: "user", content: prompt },
                ],
            });

            const response = completion.choices[0].message.content;
            console.log('Generated response:', response);
            responses.push(response);
        } catch (error) {
            console.error('Error processing prompt:', error);
        }
    }

    return responses;
}

// Retrieve the prompt list from local storage
const promptList = getPromptList();

// Generate responses for all prompts
generateResponses(promptList).then((responses) => {
    console.log('Final responses:', responses);
    // You can now use these responses as needed
});
