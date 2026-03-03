import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text, List } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PatientStackParamList } from '@navigation/patient/PatientNavigator';
import { Screen, AppButton, LoadingOverlay, ErrorState, AppCard } from '@components/AppPrimitives';
import { analyzeDentalPhoto, interpretAnalysis } from '@services/aiService';
import { useAnalysisStore } from '@store/analysisStore';
import { RiskLevel, AiResult, AiFinding } from '@types/models';

type Props = NativeStackScreenProps<PatientStackParamList, 'AnalysisResult'>;

function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F97316';
    default:
      return '#22C55E';
  }
}

function buildInterpretation(result: AiResult): string {
  const mainFinding = result.findings[0];
  const mainScore = (mainFinding?.confidence ?? 0) * 100;

  let riskSentence: string;
  if (result.riskLevel === 'high') {
    riskSentence =
      'Bu analizde risk seviyesi YÜKSEK olarak değerlendirildi. Kısa süre içinde bir diş hekimine muayene olmanız önerilir.';
  } else if (result.riskLevel === 'medium') {
    riskSentence =
      'Bu analizde risk seviyesi ORTA düzeyde görünüyor. Yakın dönemde bir kontrol randevusu planlamanız ve ağız bakımınızı sıkılaştırmanız faydalı olur.';
  } else {
    riskSentence =
      'Bu analizde belirgin yüksek risk saptanmadı. Yine de düzenli diş hekimi kontrollerine devam etmeniz ve günlük bakımınıza dikkat etmeniz önemlidir.';
  }

  const mainSentence = mainFinding
    ? `Model, özellikle “${mainFinding.title}” bulgusuna odaklanıyor (yaklaşık %${mainScore.toFixed(
        0,
      )} güven).`
    : 'Model belirgin bir odak bulguya işaret etmiyor.';

  const otherImportant = result.findings
    .slice(1)
    .filter((f) => f.confidence >= 0.4)
    .map((f) => f.title);

  const otherSentence =
    otherImportant.length > 0
      ? `Ayrıca şu durumlar da dikkat çekiyor: ${otherImportant.join(', ')}.`
      : 'Ek olarak öne çıkan farklı bir bulgu raporlanmadı.';

  return `${riskSentence}\n\n${mainSentence}\n\n${otherSentence}`;
}

function mapFindingToDisplay(f: AiFinding): { title: string; description: string } {
  switch (f.title) {
    case 'Calculus':
      return {
        title: 'Diş Taşı (Calculus)',
        description:
          'Diş yüzeylerinde sertleşmiş plak birikimi olabilir. Düzenli fırçalama ve diş ipi kullanımı yanında profesyonel temizlik gerekebilir.',
      };
    case 'Caries':
      return {
        title: 'Çürük (Caries)',
        description:
          'Bazı bölgelerde mine kaybı veya başlangıç çürük alanları olabilir. Erken dönemde müdahale ile daha büyük problemler önlenebilir.',
      };
    case 'Gingivitis':
      return {
        title: 'Diş Eti İltihabı (Gingivitis)',
        description:
          'Diş etlerinde kızarıklık, şişlik veya kanama riski olabilir. Diş eti sağlığı için fırçalama tekniği ve ara yüz temizliği önemlidir.',
      };
    case 'Mouth Ulcer':
      return {
        title: 'Aft / Ağız İçi Yara',
        description:
          'Ağız içinde hassasiyet veya yüzeysel yaralar görülebilir. Uzayan veya çok ağrılı durumlarda mutlaka diş hekimi ya da hekim kontrolü önerilir.',
      };
    case 'Tooth Discoloration':
      return {
        title: 'Diş Renklenmesi',
        description:
          'Bazı dişlerde renk değişikliği veya lekelenmeler olabilir. Nedene göre profesyonel temizlik veya beyazlatma seçenekleri değerlendirilebilir.',
      };
    case 'hypodontia':
      return {
        title: 'Doğuştan Eksik Diş (Hypodontia)',
        description:
          'Bazı dişlerin doğuştan eksik olma olasılığı vardır. Diş dizilimi ve çiğneme fonksiyonu için ortodontik veya protetik planlama gerekebilir.',
      };
    default:
      return {
        title: f.title,
        description:
          'Diş görüntüsünde dikkat çeken bir bulgu saptandı. Detaylı yorum için diş hekimi muayenesi gerekir.',
      };
  }
}

export const AnalysisResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const { lastResult, setResult, lastInterpretation, setInterpretation } = useAnalysisStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!lastResult);
  const [llmText, setLlmText] = useState<string | null>(lastInterpretation);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (lastResult) return;
      setLoading(true);
      setError(null);
      try {
        const res = await analyzeDentalPhoto(imageUri);
        if (isMounted) {
          setResult(res);
        }
      } catch {
        if (isMounted) setError('Analiz sonucu alınırken hata oluştu.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [imageUri, lastResult, setResult]);

  useEffect(() => {
    if (!lastResult) return;
    let cancelled = false;

    const run = async () => {
      try {
        const text = await interpretAnalysis(lastResult);
        if (!cancelled) {
          setLlmText(text);
          setInterpretation(text); // store'a kaydet, AnamnesisForm okuyacak
        }
      } catch {
        if (!cancelled) {
          // LLM başarısız olursa yerleşik yorum store'a yazılır
          const fallback = buildInterpretation(lastResult);
          setLlmText(null);
          setInterpretation(fallback);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [lastResult, setInterpretation]);

  if (loading && !lastResult) {
    return (
      <Screen scroll={false}>
        <View style={styles.loadingContainer}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Analiz yapılıyor, lütfen bekleyin...
          </Text>
          <LoadingOverlay />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} />
      </Screen>
    );
  }

  if (!lastResult) {
    return (
      <Screen>
        <ErrorState message="Analiz sonucu bulunamadı." />
      </Screen>
    );
  }

  const topFindings = [...lastResult.findings]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return (
    <Screen>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        Analiz Özeti
      </Text>
      <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
        {lastResult.summary}
      </Text>

      <Chip
        style={{ marginBottom: 16, alignSelf: 'flex-start' }}
        selectedColor="#fff"
        showSelectedCheck={false}
        selected
        icon={
          lastResult.riskLevel === 'high'
            ? 'alert-circle-outline'
            : lastResult.riskLevel === 'medium'
              ? 'alert-outline'
              : 'check-circle-outline'
        }
        compact
      >
        <Text style={{ color: '#fff' }}>
          Risk: {lastResult.riskLevel === 'high' ? 'Yüksek' : lastResult.riskLevel === 'medium' ? 'Orta' : 'Düşük'}
        </Text>
      </Chip>

      <AppCard title="DentiScan Yorumu">
        <Text variant="bodyMedium">
          {llmText ?? buildInterpretation(lastResult)}
        </Text>
      </AppCard>

      <AppCard title="Bulgular">
        {topFindings.map((f, idx) => {
          const mapped = mapFindingToDisplay(f);
          return (
            <List.Item
              key={idx}
              title={mapped.title}
              description={`${mapped.description}\nTahmini güven: ${(f.confidence * 100).toFixed(
                0,
              )}%`}
              descriptionNumberOfLines={10}
              left={(props) => <List.Icon {...props} icon="tooth-outline" />}
            />
          );
        })}
      </AppCard>

      <AppCard title="Öneriler">
        {lastResult.recommendations.map((rec, idx) => (
          <List.Item
            key={idx}
            title={rec}
            titleNumberOfLines={10}
            left={(props) => <List.Icon {...props} icon="check-circle-outline" />}
          />
        ))}
      </AppCard>

      <View style={{ marginTop: 8 }}>
        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
          {lastResult.disclaimer}
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Anamnez Doldur"
          onPress={() =>
            navigation.navigate('AnamnesisForm', {
              imageUri,
              analysisId: 'latest',
            })
          }
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  riskChip: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  riskText: {
    color: '#fff',
  },
  riskHigh: {
    backgroundColor: riskColor('high'),
  },
  riskMedium: {
    backgroundColor: riskColor('medium'),
  },
  riskLow: {
    backgroundColor: riskColor('low'),
  },
});

