import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'Audio no recibido' }, { status: 400 });
    const transcription = await openai.audio.transcriptions.create({ file, model: 'gpt-4o-transcribe' });
    return Response.json({ text: transcription.text || '' });
  } catch (error: any) {
    console.error('TRANSCRIBE ERROR', error);
    return Response.json({ error: error.message || 'Error transcribiendo audio' }, { status: 500 });
  }
}
