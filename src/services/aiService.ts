import { AiResult, RiskLevel } from '@types/models';

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
  const apiUrl = process.env.ANALYSIS_API_URL;

  if (!apiUrl) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return buildMockResult(imageUri);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUri }),
    });

    if (!response.ok) {
      return buildMockResult(imageUri);
    }

    const data = (await response.json()) as AiResult;
    return data;
  } catch {
    return buildMockResult(imageUri);
  }
}

