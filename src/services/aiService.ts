import { AiResult, RiskLevel } from '@types/models';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MOCK_DISCLAIMER = 'Bu sonuç tıbbi tanı değildir; kesin değerlendirme için diş hekimi muayenesi gerekir.';

function inferRiskFromHeuristics(imageUri: string): RiskLevel {
  if (imageUri.includes('high')) return 'high';
  if (imageUri.includes('mid')) return 'medium';
  return 'low';
}

function buildMockResult(imageUri: string): AiResult {
  const riskLevel = inferRiskFromHeuristics(imageUri);

  return {
    summary:
      riskLevel === 'high'
        ? 'Posterior bölgede belirgin renk değişikliği ve olası mine kırığı saptandı.'
        : riskLevel === 'medium'
          ? 'Bazı bölgelerde mine yüzeyinde düzensizlik ve renklenme gözleniyor.'
          : 'Genel diş dizisi düzenli, belirgin çürük odağı izlenmiyor.',
    riskLevel,
    findings: [
      {
        title: riskLevel === 'high' ? 'Olası derin çürük' : 'Olası başlangıç çürük alanları',
        confidence: riskLevel === 'high' ? 0.82 : 0.64,
        note:
          riskLevel === 'high'
            ? 'Alt molar bölgede koyu renklenme ve mine-kemik sınırında düzensizlik dikkat çekiyor.'
            : 'Arka bölgelerde minede noktasal renk değişiklikleri ve plak tutulumu izleniyor.',
      },
      {
        title: 'Plak birikimi',
        confidence: 0.71,
        note: 'Gingival marjine yakın bölgelerde plak benzeri opak alanlar mevcut.',
      },
    ],
    recommendations: [
      'Yakın zamanda diş hekimi muayenesi planlayın.',
      'Günde en az 2 kez florürlü diş macunu ile fırçalayın.',
      'Diş ipi veya arayüz fırçası kullanmayı günlük rutine ekleyin.',
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
    disclaimer: MOCK_DISCLAIMER,
  };
}

export async function analyzeDentalPhoto(imageUri: string): Promise<AiResult> {
  const apiUrl = 'https://0ac9-34-127-99-107.ngrok-free.app/analyze';

  try {
    // eslint-disable-next-line no-console
    console.log('[AI] Calling backend at', apiUrl);

    const manipulated = await manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.7,
        format: SaveFormat.JPEG,
        base64: true,
      },
    );

    if (!manipulated.base64) {
      return buildMockResult(imageUri);
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64: manipulated.base64 }),
    });

    // eslint-disable-next-line no-console
    console.log('[AI] Backend response status', response.status);

    if (!response.ok) {
      return buildMockResult(imageUri);
    }

    const data = (await response.json()) as AiResult;
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[AI] Error while calling backend', e);
    return buildMockResult(imageUri);
  }
}

export async function interpretAnalysis(result: AiResult): Promise<string> {
  const url = 'https://0ac9-34-127-99-107.ngrok-free.app/interpret';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ result }),
    });

    if (!response.ok) {
      throw new Error(`LLM interpret error: ${response.status}`);
    }

    const data = (await response.json()) as { interpretation: string };
    return data.interpretation;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[AI] Error while calling interpret endpoint', e);
    throw e;
  }
}

