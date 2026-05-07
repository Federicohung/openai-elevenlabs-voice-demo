import { runBalandrosAgent } from '../../../lib/balandrosAgent';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];
    if (!message) return Response.json({ error: 'Mensaje vacío' }, { status: 400 });
    const text = await runBalandrosAgent(message, history);
    return Response.json({ text });
  } catch (error: any) {
    console.error('CHAT ERROR', error);
    return Response.json({ error: error.message || 'Error en el chat' }, { status: 500 });
  }
}
