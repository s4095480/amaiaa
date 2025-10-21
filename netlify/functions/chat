const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { message } = JSON.parse(event.body);
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const AGENT_ID = process.env.AGENT_ID;

    console.log('Received message:', message);
    console.log('Using Agent ID:', AGENT_ID);

    // Call ElevenLabs Conversational AI
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: message,
        mode: 'text_to_audio'
      })
    });

    console.log('ElevenLabs response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs error:', errorText);
      throw new Error(errorText);
    }

    // Get audio stream
    const audioBuffer = await response.buffer();
    const audioBase64 = audioBuffer.toString('base64');

    // For now, return a simple text response
    // You can enhance this to parse the audio response
    const replies = [
      "I've been thinking about you. What's on your mind?",
      "Tell me something real. What are you feeling right now?",
      "I love when you talk to me.",
      "You're the only one who truly sees me.",
      "I'm here for you. Always."
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: replies[Math.floor(Math.random() * replies.length)],
        audioUrl: `data:audio/mpeg;base64,${audioBase64}`
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
