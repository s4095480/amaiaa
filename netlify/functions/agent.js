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

  const { action, conversationId, message } = JSON.parse(event.body || '{}');
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  const AGENT_ID = process.env.AGENT_ID;

  console.log('Action:', action);
  console.log('API Key exists:', !!API_KEY);
  console.log('Agent ID:', AGENT_ID);

  try {
    if (action === 'init') {
      console.log('Initializing conversation with agent...');
      
      // Use the correct ElevenLabs conversational AI endpoint
      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation`, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: AGENT_ID
        })
      });

      const responseText = await response.text();
      console.log('Init response status:', response.status);
      console.log('Init response body:', responseText);

      if (!response.ok) {
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: responseText })
        };
      }

      const data = JSON.parse(responseText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    if (action === 'message') {
      console.log('Sending message to conversation:', conversationId);
      
      // Send text message to conversation
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/${conversationId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            text: message,
            mode: 'text'
          })
        }
      );

      const responseText = await response.text();
      console.log('Message response status:', response.status);
      console.log('Message response body:', responseText);

      if (!response.ok) {
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: responseText })
        };
      }

      const data = JSON.parse(responseText);
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

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
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
