const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    console.log('Invalid method:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const AGENT_ID = process.env.AGENT_ID;

    console.log('API Key exists:', !!API_KEY);
    console.log('Agent ID:', AGENT_ID || 'undefined');

    if (!API_KEY || !AGENT_ID) {
      console.log('Missing API key or agent ID');
      res.status(400).json({ error: 'Missing API key or agent ID' });
      return;
    }

    console.log('Fetching signed URL from ElevenLabs...');
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`, {
      method: 'GET',
      headers: {
        'xi-api-key': API_KEY
      }
    });

    console.log('Signed URL response status:', response.status);
    const responseText = await response.text();
    console.log('Signed URL response body:', responseText);

    if (!response.ok) {
      console.error('Signed URL error details:', responseText);
      throw new Error(`Failed to get signed URL: ${response.status} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('JSON parse error:', e.message);
      throw new Error('Invalid response format from ElevenLabs');
    }

    console.log('Signed URL fetched:', data.signed_url.slice(0, 50) + '...');

    res.status(200).json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error('Handler error:', error.message, error.stack);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
