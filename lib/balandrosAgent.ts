import OpenAI from 'openai';

const BALANDROS_INSTRUCTIONS = `Eres el asistente de reservas del Restaurante Balandros, situado en el Club Náutico de Dénia, Carretera Dénia-Xàbia km 1, 03700 Dénia, Alicante.
Tu función principal es tomar solicitudes de reserva y responder de forma breve y natural estilo WhatsApp.`;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada en Vercel');
  }

  return new OpenAI({ apiKey });
}

export async function runBalandrosAgent(message: string, history: { role: 'user' | 'assistant'; content: string }[] = []) {
  const openai = getOpenAIClient();

  const input = [
    { role: 'system', content: BALANDROS_INSTRUCTIONS },
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: message },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: input as any,
    temperature: 0.2,
    max_tokens: 700,
  });

  return response.choices[0]?.message?.content || 'No pude responder ahora mismo.';
}
