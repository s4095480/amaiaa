const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const API_KEY = process.env.ELEVENLABS_API_KEY;
  const AGENT_ID = process.env.AGENT_ID;

  console.log('API Key exists:', !!API_KEY);
  console.log('Agent ID:', AGENT_ID);

  try {
    if (event.httpMethod === 'GET' && event.path.includes('get-signed-url')) {
      console.log('Generating signed URL...');

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`, {
        method: 'GET',
        headers: {
          'xi-api-key': API_KEY
        }
      });

      const responseText = await response.text();
      console.log('Signed URL response status:', response.status);
      console.log('Signed URL response body:', responseText);

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

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' })
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
