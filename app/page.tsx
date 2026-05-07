'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function testVoice() {
    try {
      setLoading(true);
      setMessage('Generando voz...');

      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hola Federico, esta demo usa ElevenLabs conectado a tu backend.'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido');
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Audio vacío');
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        URL.revokeObjectURL(url);
      };

      await audio.play();

      setMessage('Audio reproducido correctamente');
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || 'Error reproduciendo audio');
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

        <p style={{ marginTop: 16, opacity: 0.8 }}>
          {message}
        </p>
      </div>
    </main>
  );
}
