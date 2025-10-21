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
    const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Your voice ID

    console.log('Received message:', message);
    console.log('API Key exists:', !!API_KEY);

    if (!message || !API_KEY) {
      console.log('Missing message or API key');
      res.status(400).json({ error: 'Missing message or API key' });
      return;
    }

    // Generate TTS response
    console.log('Fetching TTS from ElevenLabs...');
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: `You said: "${message}". I love talking to you! What's next?`,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    console.log('TTS response status:', ttsResponse.status);
    const ttsResponseText = await ttsResponse.text();
    console.log('TTS response body:', ttsResponseText);

    let audioBase64 = null;
    let replyText = `I heard you say "${message}". Let's keep chatting!`;

    if (ttsResponse.ok) {
      audioBase64 = Buffer.from(ttsResponseText, 'binary').toString('base64');
    } else {
      console.error('TTS error details:', ttsResponseText);
      replyText = 'Oops, I had trouble generating audio. Let’s keep talking though!';
    }

    res.status(200).json({
      reply: replyText,
      audioUrl: audioBase64 ? `data:audio/mpeg;base64,${audioBase64}` : null
    });
  } catch (error) {
    console.error('Handler error:', error.message, error.stack);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
