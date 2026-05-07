import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada');
  }

  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'Audio requerido' }, { status: 400 });
    }

    const openai = getClient();

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    return Response.json({ text: transcription.text });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Error transcribiendo audio' }, { status: 500 });
  }
}
