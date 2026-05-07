import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenAI Agent + ElevenLabs Voice Demo',
  description: 'Minimal voice test web app for an OpenAI agent backend using ElevenLabs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
