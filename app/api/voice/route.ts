export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = String(body.text || 'Hola desde Balandros');

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'ELEVENLABS_API_KEY no configurada' }, { status: 500 });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: errorText }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Error generando voz' }, { status: 500 });
  }
}
