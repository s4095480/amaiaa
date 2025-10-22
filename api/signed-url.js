const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const AGENT_ID = process.env.AGENT_ID;

    console.log('API Key exists:', !!API_KEY);
    console.log('Agent ID:', AGENT_ID);

    if (!API_KEY || !AGENT_ID) {
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
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Signed URL error details:', errorText);
      throw new Error(`Failed to get signed URL: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
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
