'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  async function testVoice() {
    try {
      setLoading(true);

      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hola, soy tu agente con voz usando ElevenLabs.'
        }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (error) {
      console.error(error);
      alert('Error reproduciendo audio');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1>OpenAI + ElevenLabs Voice Demo</h1>
        <p>
          Demo mínima para conectar un agente OpenAI con capacidades de voz de ElevenLabs.
        </p>

        <button onClick={testVoice} disabled={loading}>
          {loading ? 'Generando voz...' : 'Probar Voz'}
        </button>
      </div>
    </main>
  );
}
