'use client';

import { useRef, useState } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hola, gracias por contactar con Restaurante Balandros. Te ayudo con tu reserva. ¿Para qué día te gustaría venir?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: clean }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setStatus('Balandros está escribiendo...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean, history: messages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error del agente');
      setMessages([...nextMessages, { role: 'assistant', content: data.text }]);
    } catch (error: any) {
      setMessages([...nextMessages, { role: 'assistant', content: error.message || 'Ha ocurrido un error.' }]);
    } finally {
      setLoading(false);
      setStatus('');
    }
  }

  async function playVoice(text: string) {
    setStatus('Generando audio...');
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error generando voz');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (error: any) {
      alert(error.message || 'No se pudo reproducir el audio');
    } finally {
      setStatus('');
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAndSend(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setStatus('Grabando nota de voz...');
    } catch {
      alert('No se pudo acceder al micrófono.');
    }
  }

  async function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
    setStatus('Transcribiendo audio...');
  }

  async function transcribeAndSend(blob: Blob) {
    try {
      const formData = new FormData();
      formData.append('file', blob, 'voice-note.webm');
      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error transcribiendo');
      await sendMessage(data.text);
    } catch (error: any) {
      alert(error.message || 'No se pudo transcribir el audio');
    } finally {
      setStatus('');
    }
  }

  return (
    <main className="chatShell">
      <section className="phoneFrame">
        <header className="chatHeader">
          <div className="avatar">B</div>
          <div>
            <h1>Restaurante Balandros</h1>
            <p>Asistente de reservas</p>
          </div>
        </header>

        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`bubbleRow ${message.role}`}>
              <div className="bubble">
                <p>{message.content}</p>
                {message.role === 'assistant' && (
                  <button className="speak" onClick={() => playVoice(message.content)}>Escuchar</button>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="typing">escribiendo...</div>}
        </div>

        {status && <div className="status">{status}</div>}

        <footer className="composer">
          <button className={`mic ${recording ? 'recording' : ''}`} onClick={recording ? stopRecording : startRecording}>
            {recording ? '■' : '🎙️'}
          </button>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') sendMessage(input);
            }}
            placeholder="Escribe un mensaje..."
          />
          <button className="send" onClick={() => sendMessage(input)}>Enviar</button>
        </footer>
      </section>
    </main>
  );
}
