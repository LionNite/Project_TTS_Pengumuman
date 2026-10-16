import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

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

  // Endpoint to refine text if requested
  app.post('/api/refine-text', async (req, res) => {
    try {
      const { text, tone = 'sopan dan lembut' } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Teks tidak boleh kosong.' });
      }

      const prompt = `Ubah teks pengumuman perpustakaan berikut agar terdengar bernada "${tone}", santun, sangat halus, ramah, dan menenangkan para pengunjung. Pertahankan maksud intinya (pengumuman perpustakaan akan tutup dalam 5 menit, merapikan barang bawaan dan fasilitas, permohonan maaf, serta ucapan terima kasih). Berikan HANYA teks pengumuman baru dalam bahasa Indonesia yang siap dibacakan, tanpa tanda petik dan tanpa penjelasan tambahan.

Teks asli:
${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({
        refinedText: response.text ? response.text.trim() : text,
      });
    } catch (error: any) {
      console.error('Error refining text:', error);
      return res.status(500).json({ error: error.message || 'Gagal menghaluskan teks.' });
    }
  });

  // Dev mode: Vite middleware; Prod mode: static dist
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server ready at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
