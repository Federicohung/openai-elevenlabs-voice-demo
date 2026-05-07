import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const audio = await elevenlabs.textToSpeech.convert(
      'JBFqnCBsd6RMkjVDRZzb',
      {
        text: body.text || 'Hola desde ElevenLabs',
        modelId: 'eleven_v3',
        outputFormat: 'mp3_44100_128',
      }
    );

    const chunks = [];

    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: 'Error generando voz' },
      { status: 500 }
    );
  }
}
