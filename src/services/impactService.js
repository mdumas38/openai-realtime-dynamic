import fetch from 'node-fetch';

/**
 * Analyzes the impact of the latest input on the current conversation.
 * @param {string} summary 
 * @param {string} latestInput 
 * @returns {Promise<boolean>} - True if significant impact, else false.
 */
export async function analyzeImpact(summary, latestInput) {
  try {
    console.log('Sending impact analysis request to server...');
    const response = await fetch('http://localhost:8080/api/analyze-impact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary, latestInput }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(`Failed to analyze impact: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('Analyze Impact API Response:', data); // Add this line
    return data.action === 'generate_new_image';
  } catch (error) {
    console.error('Error analyzing impact:', error);
    // Default to no impact to avoid unnecessary actions
    return false;
  }
}

// // Example usage
// const summary = "The conversation is about favorite basketball players, with a focus on LeBron James and his qualities.";
// const latestInput = "the house is on fire!!";

// analyzeImpact(summary, latestInput).then(isSignificantImpact => {
//   if (isSignificantImpact) {
//     console.log("The latest input has a significant impact on the conversation.");
//   } else {
//     console.log("The latest input does not have a significant impact on the conversation.");
//   }
// });

