import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { RealtimeRelay } from './lib/relay.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define routes
app.post('/api/generate-response', async (req, res) => {
  try {
    const { prompt, summary } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates image descriptions based on conversation context and user prompts." },
        { role: "user", content: `Given the following conversation summary: "${summary}", generate a detailed image description based on this prompt: ${prompt}` }
      ],
      max_tokens: 3000
    });

    const response = completion.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    console.error('Error processing prompt:', error);
    res.status(500).json({ error: 'An error occurred while processing the prompt.' });
  }
});

// New route for generating image prompts
app.post('/api/generate-image-prompt', async (req, res) => {
  try {
    const { summary } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are an AI assistant that generates concise and highly specific image prompts. Focus on composition, color, lighting, and style to craft detailed, visual representations based on the provided conversation summary. Break the prompt into clear, modular components to ensure high-quality results.` },
        { role: "user", content: `You are an AI assistant tasked with generating detailed image prompts based on conversation summaries. Your goal is to create a concise, highly descriptive image prompt by focusing on key visual elements. Follow these guidelines to structure the prompt:

          1.	Subject/Composition:
          •	Identify the main subject(s) or objects from the summary.
          •	Example: “A futuristic cityscape,” or “A tranquil forest scene.”
          2.	Setting/Environment:
          •	Describe the setting or environment where the subject exists.
          •	Example: “At sunset with long shadows,” or “A snowy mountain range.”
          3.	Mood/Color:
          •	Capture the mood or emotional tone and translate it into colors or lighting.
          •	Example: “Vibrant neon colors with a tense atmosphere,” or “Soft pastels evoking calm and peace.”
          4.	Lighting:
          •	Define the lighting style to set the visual tone (e.g., cinematic, soft shadows, dramatic backlighting).
          •	Example: “Dramatic lighting with sharp contrasts,” or “Soft natural lighting with gentle shadows.”
          5.	Details/Style:
          •	Add any additional stylistic details (e.g., film style, texture, or artistic influences).
          •	Example: “Film grain texture, 35mm Kodak style,” or “In the style of a watercolor painting.”

        Generate the final image prompt based on this framework, ensuring that the prompt includes these key elements, clearly described, and is adapted to fit the content of the provided conversation summary.: ${summary}` }
      ],
      max_tokens: 3000
    });

    const imagePrompt = completion.choices[0].message.content;
    res.json({ imagePrompt });
  } catch (error) {
    console.error('Error generating image prompt:', error);
    res.status(500).json({ error: 'An error occurred while generating the image prompt.' });
  }
});

// New route for generating summaries
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { conversationText } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes conversations." },
        { role: "user", content: `Summarize the following conversation: ${conversationText}` }
      ],
      max_tokens: 3000
    });

    const summary = completion.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'An error occurred while generating the summary.' });
  }
});

// New route for analyzing impact
app.post('/api/analyze-impact', async (req, res) => {
  try {
    const { summary, latestInput } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI assistant that analyzes the impact of new input on a conversation summary." },
        { role: "user", content: `Given the following conversation summary: "${summary}", analyze the impact of this new input: "${latestInput}". Respond with 'true' if the impact is significant, or 'false' if not significant.` }
      ],
      max_tokens: 5
    });

    const impact = completion.choices[0].message.content.trim().toLowerCase() === 'true';
    res.json({ isSignificant: impact });
  } catch (error) {
    console.error('Error analyzing impact:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the impact.' });
  }
});

// Define ports
const HTTP_PORT = 8080;
const WS_PORT = process.env.WS_PORT || 8081;

// Start the express server
app.listen(HTTP_PORT, () => {
  console.log(`HTTP server running at http://localhost:${HTTP_PORT}`);
});

// Initialize and start the relay server
const relay = new RealtimeRelay(process.env.OPENAI_API_KEY, app);
relay.listen(WS_PORT);