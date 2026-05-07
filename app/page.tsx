'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('Hola, esta es una prueba de voz con ElevenLabs.');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Escribe un texto y presiona el botón para escucharlo.');

  async function testVoice() {
    try {
      setLoading(true);
      setMessage('Generando voz...');

      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error desconocido');
        }

        throw new Error(`Error HTTP ${response.status}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('ElevenLabs respondió audio vacío');
      }

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => URL.revokeObjectURL(url);

      await audio.play();
      setMessage('Audio reproducido correctamente.');
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || 'Error reproduciendo audio.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1>OpenAI + ElevenLabs Voice Demo</h1>

        <p>
          Escribe un texto, el backend lo manda a ElevenLabs y el navegador reproduce el MP3.
        </p>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          placeholder="Escribe el texto que quieres convertir a voz..."
        />

        <button onClick={testVoice} disabled={loading || text.trim().length === 0}>
          {loading ? 'Generando voz...' : 'Convertir texto a voz'}
        </button>

        <p className="status">{message}</p>
      </div>
    </main>
  );
}
