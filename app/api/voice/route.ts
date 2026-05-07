import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const audioStream = await elevenlabs.textToSpeech.convert(
      'JBFqnCBsd6RMkjVDRZzb',
      {
        text: body.text || 'Hola desde ElevenLabs',
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      }
    );

    const chunks: Uint8Array[] = [];

    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('ELEVENLABS ERROR:', error);

    return Response.json(
      {
        error: error.message || 'Error generando voz',
      },
      {
        status: 500,
      }
    );
  }
}
