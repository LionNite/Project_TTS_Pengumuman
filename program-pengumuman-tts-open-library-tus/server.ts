import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dedicated directory for physical audio storage in PC File Explorer
const SAVED_AUDIO_DIR = path.resolve(__dirname, 'saved_audio');
if (!fs.existsSync(SAVED_AUDIO_DIR)) {
  fs.mkdirSync(SAVED_AUDIO_DIR, { recursive: true });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '25mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', hasKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // Local saved audio directory status / file list
  app.get('/api/saved-audio', (_req, res) => {
    try {
      if (!fs.existsSync(SAVED_AUDIO_DIR)) {
        return res.json({ files: [], directory: SAVED_AUDIO_DIR });
      }
      const files = fs.readdirSync(SAVED_AUDIO_DIR).filter((f) => f.endsWith('.wav'));
      return res.json({ files, directory: SAVED_AUDIO_DIR });
    } catch (err: any) {
      console.error('Failed to list saved audio:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Save audio WAV file directly to PC local directory
  app.post('/api/saved-audio', (req, res) => {
    try {
      const { id, title, audioBase64, filename } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'Data audio base64 diperlukan.' });
      }

      if (!fs.existsSync(SAVED_AUDIO_DIR)) {
        fs.mkdirSync(SAVED_AUDIO_DIR, { recursive: true });
      }

      // Sanitize filename for Windows & Linux filesystem compatibility
      const safeTitle = (title || 'pengumuman')
        .replace(/[^a-zA-Z0-9_\-\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 50);
      const safeId = (id || `audio_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '');
      const targetFilename = filename || `${safeId}_${safeTitle}.wav`;
      const filePath = path.join(SAVED_AUDIO_DIR, targetFilename);

      const buffer = Buffer.from(audioBase64, 'base64');
      fs.writeFileSync(filePath, buffer);

      console.log(`[VoiceAnnounce] Saved audio to PC disk: ${filePath}`);
      return res.json({ success: true, filename: targetFilename, path: filePath });
    } catch (err: any) {
      console.error('Failed to save audio to disk:', err);
      return res.status(500).json({ error: err.message || 'Gagal menyimpan audio ke disk.' });
    }
  });

  // Delete audio file from PC local directory
  app.delete('/api/saved-audio/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { filename } = req.query;

      if (!fs.existsSync(SAVED_AUDIO_DIR)) {
        return res.json({ success: true, message: 'Direktori belum ada' });
      }

      if (filename && typeof filename === 'string') {
        const filePath = path.join(SAVED_AUDIO_DIR, path.basename(filename));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[VoiceAnnounce] Deleted audio file: ${filePath}`);
        }
        return res.json({ success: true });
      }

      const files = fs.readdirSync(SAVED_AUDIO_DIR);
      let deletedCount = 0;
      for (const file of files) {
        if (file.startsWith(id) || file.includes(id)) {
          const filePath = path.join(SAVED_AUDIO_DIR, file);
          fs.unlinkSync(filePath);
          console.log(`[VoiceAnnounce] Deleted matching audio file: ${filePath}`);
          deletedCount++;
        }
      }

      return res.json({ success: true, deletedCount });
    } catch (err: any) {
      console.error('Failed to delete audio from disk:', err);
      return res.status(500).json({ error: err.message || 'Gagal menghapus audio dari disk.' });
    }
  });

  // TTS Endpoint using gemini-3.8-flash-tts
  app.post('/api/tts', async (req, res) => {
    try {
      const {
        text,
        voice = 'Kore',
        style = 'Sopan, tenang, ramah, dan bersuara lembut untuk pengumuman perpustakaan',
      } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Teks pengumuman tidak boleh kosong.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY belum dikonfigurasi di environment server.',
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  speaker: 'Penyiar Perpustakaan',
                  style: style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!audioPart || !audioPart.data) {
        throw new Error('Gagal menerima audio dari model Gemini TTS.');
      }

      return res.json({
        audioBase64: audioPart.data,
        mimeType: audioPart.mimeType || 'audio/wav',
        voice,
      });
    } catch (error: any) {
      console.error('Error generating audio with gemini-3.8-flash-tts:', error);
      return res.status(500).json({
        error: error.message || 'Terjadi kendala teknis saat memproses teks ke suara.',
      });
    }
  });

  // Endpoint to refine text with Gemini
  app.post('/api/refine-text', async (req, res) => {
    try {
      const { text, tone = 'sopan dan lembut' } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Teks tidak boleh kosong.' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY belum dikonfigurasi di environment server.',
        });
      }

      const prompt = `Anda adalah penyiar profesional di perpustakaan. 
Tolong sempurnakan teks pengumuman berikut agar terdengar lebih jelas, santun, terstruktur rapi, dan nyaman didengar dengan gaya "${tone}".
Pertahankan maksud dan informasi penting dari teks asli (jam, lokasi, aturan, dll).
Hanya keluarkan teks naskah hasil penyempurnaan, tanpa tanda petik pembuka/penutup, dan tanpa komentar penjelasan tambahan.

Teks Asli:
${text.trim()}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const refinedText = response.text?.trim() || text;

      return res.json({ refinedText });
    } catch (error: any) {
      console.error('Error refining text with Gemini:', error);
      return res.status(500).json({
        error: error.message || 'Gagal menyempurnakan teks dengan AI.',
      });
    }
  });

  // Vite integration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[VoiceAnnounce] Server running on port ${PORT}`);
    console.log(`[VoiceAnnounce] Saved audio physical path: ${SAVED_AUDIO_DIR}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
