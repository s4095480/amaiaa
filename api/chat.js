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

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message } = req.body;
    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = 'MvVkLH9bosldCRpQiTw1';

    console.log('Received message:', message);
    console.log('API Key exists:', !!API_KEY);
    console.log('Using Voice ID:', VOICE_ID);

    if (!message || !API_KEY) {
      console.log('Missing message or API key');
      res.status(400).json({ error: 'Missing message or API key' });
      return;
    }

    console.log('Fetching TTS from ElevenLabs...');
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: `You said "${message}". Talk more?`,
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
    const audioData = Buffer.from(audioBuffer);
    console.log('Raw MP3 first 10 bytes:', audioData.slice(0, 10).toString('hex')); // Debug MP3 header
    const audioBase64 = audioData.toString('base64');
    console.log('Audio base64 length:', audioBase64.length);
    console.log('Audio base64 starts with:', audioBase64.slice(0, 20));

    const replyText = `I heard you say "${message}". Let's keep chatting!`;

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
