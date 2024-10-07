export async function generateSummary(conversationText) {
  try {
    const response = await fetch('http://localhost:8080/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversationText }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(`Failed to generate summary: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return `Summary: ${conversationText.slice(0, 100)}... (Error: ${error.message})`;
  }
}

// //example usage
// const conversationText = "Hey, have you checked out the latest video game releases? Yes, I just got the new RPG game. It's amazing! I heard the graphics are stunning. How's the gameplay? The gameplay is smooth and the storyline is very engaging. What other new games are out this month?";

// const summary = await generateSummary(conversationText);
// console.log(`Summary: ${summary}`);