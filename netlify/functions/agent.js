const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const { action, conversationId, message } = JSON.parse(event.body);
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  const AGENT_ID = process.env.AGENT_ID;

  try {
    if (action === 'init') {
      // Initialize conversation
      const response = await fetch('https://api.elevenlabs.io/v1/agents/conversations', {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          mode: 'streaming'
        })
      });

      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    if (action === 'message') {
      // Send message to agent
      const response = await fetch(
        `https://api.elevenlabs.io/v1/agents/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: message })
        }
      );

      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    if (action === 'voice') {
      // Generate voice
      const { text } = JSON.parse(event.body);
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (response.ok) {
        const audioBuffer = await response.buffer();
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
          body: audioBuffer.toString('base64'),
          isBase64Encoded: true
        };
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
