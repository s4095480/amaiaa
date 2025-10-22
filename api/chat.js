const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message } = req.body;
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const AGENT_ID = process.env.AGENT_ID;
    const VOICE_ID = 'MvVkLH9bosldCRpQiTw1'; // Your voice ID

    console.log('Received message:', message);
    console.log('API Key exists:', !!API_KEY);
    console.log('Agent ID:', AGENT_ID);
    console.log('Voice ID:', VOICE_ID);

    if (!message || !API_KEY || !AGENT_ID) {
      res.status(400).json({ error: 'Missing message, API key, or agent ID' });
      return;
    }

    // Step 1: Call the agent for an intelligent reply (using conversation API)
    console.log('Calling ElevenLabs agent for response...');
    const agentResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: message,
        mode: 'text' // Get text response first
      })
    });

    console.log('Agent response status:', agentResponse.status);
    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Agent error details:', errorText);
      throw new Error(`Agent request failed: ${agentResponse.status} - ${errorText}`);
    }

    const agentData = await agentResponse.json();
    let replyText = agentData.reply || agentData.text || 'Sorry, I didn't understand that. Tell me more?';
    console.log('Agent response text:', replyText);

    // Step 2: Convert reply to speech with TTS
    console.log('Fetching TTS from ElevenLabs...');
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: replyText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    console.log('TTS response status:', ttsResponse.status);
    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('TTS error details:', errorText);
      throw new Error(`TTS request failed: ${ttsResponse.status} - ${errorText}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    console.log('Audio base64 length:', audioBase64.length);

    res.status(200).json({
      reply: replyText,
      audioUrl: `data:audio/mpeg;base64,${audioBase64}`
    });
  } catch (error) {
    console.error('Handler error:', error.message, error.stack);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
