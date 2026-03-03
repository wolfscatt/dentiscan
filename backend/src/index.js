import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const HF_API_URL =
  process.env.HF_API_URL ||
  'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
const HF_API_KEY = process.env.HF_API_KEY;

if (!HF_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[WARN] HF_API_KEY is not set. The /analyze endpoint will return a mock result.',
  );
}

/**
 * Simple health check
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

/**
 * Analyze dental photo using a Hugging Face vision model.
 *
 * Expected body:
 * {
 *   "imageBase64": "..." // base64 without data URI prefix
 * }
 */
app.post('/analyze', async (req, res) => {
  const { imageBase64 } = req.body || {};

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 (base64-encoded image) is required.' });
  }

  try {
    let hfResult = null;

    if (HF_API_KEY) {
      const imageBuffer = Buffer.from(imageBase64, 'base64');

      const hfResponse = await axios.post(HF_API_URL, imageBuffer, {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/octet-stream',
        },
        timeout: 30000,
      });

      hfResult = hfResponse.data;
    }

    // Map Hugging Face response (usually an array of {label, score})
    const top =
      Array.isArray(hfResult) && hfResult.length > 0
        ? hfResult[0]
        : { label: 'Normal', score: 0.5 };

    const score = typeof top.score === 'number' ? top.score : 0.5;
    let riskLevel = 'low';
    if (score > 0.75) riskLevel = 'high';
    else if (score > 0.5) riskLevel = 'medium';

    const aiResult = {
      summary: `Model çıktısı: ${top.label} (güven skoru: ${(score * 100).toFixed(1)}%).`,
      riskLevel,
      findings: [
        {
          title: top.label,
          confidence: score,
          note:
            'Bu bulgu, genel amaçlı bir görüntü sınıflandırma modelinin çıktısıdır. Diş hekimi muayenesinin yerini tutmaz.',
        },
      ],
      recommendations: [
        'Düzenli diş fırçalama ve diş ipi kullanımına devam edin.',
        'Şikayetiniz varsa bir diş hekimi randevusu planlayın.',
      ],
      anamnesis: {
        pain: {
          value: null,
          questions: ['Ağrı var mı?', 'Sıcak/soğuk hassasiyeti hissediyor musunuz?'],
        },
        bleeding: {
          value: null,
          questions: ['Diş eti kanaması oluyor mu?', 'Fırçalama sırasında kanama fark ediyor musunuz?'],
        },
        duration: {
          value: null,
          questions: ['Şikayet ne zamandır var?', 'Son haftalarda artış fark ettiniz mi?'],
        },
        medical: {
          value: null,
          questions: ['Düzenli ilaç kullanımı var mı?', 'Bilinen kronik hastalıklarınız var mı?'],
        },
      },
      disclaimer:
        'Bu sonuç tıbbi tanı değildir; genel amaçlı bir görsel modelden üretilmiştir. Kesin değerlendirme için diş hekimi muayenesi gerekir.',
    };

    return res.json(aiResult);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error calling Hugging Face API:', error?.message || error);
    return res.status(500).json({ error: 'Failed to analyze image via Hugging Face API.' });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Dentiscan backend listening on http://localhost:${port}`);
});

