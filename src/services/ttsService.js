// src/services/ttsService.js
export async function generateSpeech(text, voiceId = 'default_voice_id') {
  try {
    const response = await fetch('http://localhost:8081/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from TTS API:', errorData);
      throw new Error(errorData.error || 'Failed to generate speech.');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
}

