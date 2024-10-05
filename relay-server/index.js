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
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates image descriptions based on conversation context and user prompts." },
        { role: "user", content: `Given the following conversation summary: "${summary}", generate a detailed image description based on this prompt: ${prompt}` }
      ],
      max_tokens: 150
    });

    const response = completion.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    console.error('Error processing prompt:', error);
    res.status(500).json({ error: 'An error occurred while processing the prompt.' });
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