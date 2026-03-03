import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, List, Chip, ActivityIndicator } from 'react-native-paper';
import type { PatientStackParamList } from '@navigation/patient/PatientNavigator';
import { Screen, AppCard, ErrorState, AppButton } from '@components/AppPrimitives';
import { getReport, updateReport } from '@services/reportService';
import type { AiFinding, Report } from '@types/models';

type Props = NativeStackScreenProps<PatientStackParamList, 'ReportDetail'>;

// Ham anamnez key -> Türkçe etiket
const ANAMNESIS_LABELS: Record<string, string> = {
  pain: 'Ağrı / Hassasiyet',
  bleeding: 'Diş Eti Kanaması',
  duration: 'Şikayet Süresi',
  medical: 'Tıbbi Geçmiş',
};

// AnalysisResultScreen ile birebir aynı: ham model etiketini Türkçe'ye çevir
function mapFindingToDisplay(f: AiFinding): { title: string; description: string } {
  switch (f.title) {
    case 'Calculus':
      return {
        title: 'Diş Taşı (Calculus)',
        description: 'Diş yüzeylerinde sertleşmiş plak birikimi olabilir. Düzenli fırçalama ve profesyonel temizlik gerekebilir.',
      };
    case 'Caries':
      return {
        title: 'Çürük (Caries)',
        description: 'Bazı bölgelerde mine kaybı veya başlangıç çürük alanları olabilir. Erken dönemde müdahale önerilir.',
      };
    case 'Gingivitis':
      return {
        title: 'Diş Eti İltihabı (Gingivitis)',
        description: 'Diş etlerinde kızarıklık, şişlik veya kanama riski olabilir.',
      };
    case 'Mouth Ulcer':
      return {
        title: 'Aft / Ağız İçi Yara',
        description: 'Ağız içinde hassasiyet veya yüzeysel yaralar görülebilir. Uzayan durumlarda hekime başvurun.',
      };
    case 'Tooth Discoloration':
      return {
        title: 'Diş Renklenmesi',
        description: 'Bazı dişlerde renk değişikliği olabilir. Profesyonel temizlik veya beyazlatma değerlendirilebilir.',
      };
    case 'hypodontia':
      return {
        title: 'Doğuştan Eksik Diş (Hypodontia)',
        description: 'Bazı dişlerin doğuştan eksik olma olasılığı vardır. Ortodontik değerlendirme gerekebilir.',
      };
    default:
      return {
        title: f.title,
        description: 'Diş görüntüsünde dikkat çeken bir bulgu saptandı. Detaylı değerlendirme için diş hekimine başvurun.',
      };
  }
}

function riskLabel(level: string): string {
  if (level === 'high') return 'Yüksek';
  if (level === 'medium') return 'Orta';
  return 'Düşük';
}

function riskColor(level: string): string {
  if (level === 'high') return '#EF4444';
  if (level === 'medium') return '#F97316';
  return '#22C55E';
}

function riskIcon(level: string): string {
  if (level === 'high') return 'alert-circle-outline';
  if (level === 'medium') return 'alert-outline';
  return 'check-circle-outline';
}

export const ReportDetailScreen: React.FC<Props> = ({ route }) => {
  const { reportId } = route.params;
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await getReport(reportId);
        if (!r) {
          setError('Rapor bulunamadı.');
        } else {
          setReport(r);
        }
      } catch {
        setError('Rapor yüklenirken hata oluştu.');
      }
    };
    run();
  }, [reportId]);

  const handleShareWithExpert = async () => {
    if (!report || report.sharedWithExpert) return;
    setSharing(true);
    try {
      const updated = await updateReport(report.id, { sharedWithExpert: true });
      if (updated) setReport(updated);
    } finally {
      setSharing(false);
    }
  };

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} />
      </Screen>
    );
  }

  if (!report) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator animating />
          <Text variant="bodyMedium" style={{ marginTop: 12 }}>Rapor yükleniyor...</Text>
        </View>
      </Screen>
    );
  }

  const aiResult = report.aiResult;

  return (
    <Screen scroll>
      <Text variant="titleLarge" style={{ marginBottom: 4 }}>
        Rapor Detayı
      </Text>
      <Text variant="bodySmall" style={{ marginBottom: 12, opacity: 0.7 }}>
        {new Date(report.createdAt).toLocaleString('tr-TR')}
      </Text>

      {/* Fotoğraf */}
      {report.imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: report.imageUri }} style={styles.image} resizeMode="cover" />
        </View>
      ) : null}

      {/* Analiz Özeti */}
      <AppCard title="Analiz Özeti">
        <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
          {aiResult?.summary ?? 'Özet bulunamadı.'}
        </Text>
        <Chip
          style={[styles.riskChip, { backgroundColor: riskColor(aiResult?.riskLevel ?? 'low') }]}
          textStyle={{ color: '#fff' }}
          icon={riskIcon(aiResult?.riskLevel ?? 'low')}
          selected
          showSelectedCheck={false}
        >
          Risk Seviyesi: {riskLabel(aiResult?.riskLevel ?? 'low')}
        </Chip>
      </AppCard>

      {/* DentiScan Yorumu */}
      {report.interpretation ? (
        <AppCard title="DentiScan Yorumu">
          <Text variant="bodyMedium">{report.interpretation}</Text>
        </AppCard>
      ) : null}

      {/* Bulgular — ham model çıktısı değil, Türkçe açıklamalar */}
      {aiResult?.findings && aiResult.findings.length > 0 && (
        <AppCard title="Bulgular">
          {aiResult.findings
            .slice()
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5)
            .map((f, idx) => {
              const mapped = mapFindingToDisplay(f);
              return (
                <List.Item
                  key={idx}
                  title={mapped.title}
                  description={`${mapped.description}\nTahmini güven: %${(f.confidence * 100).toFixed(0)}`}
                  descriptionNumberOfLines={6}
                  left={(props) => <List.Icon {...props} icon="tooth-outline" />}
                />
              );
            })}
        </AppCard>
      )}

      {/* Öneriler */}
      {aiResult?.recommendations && aiResult.recommendations.length > 0 && (
        <AppCard title="Öneriler">
          {aiResult.recommendations.map((rec, idx) => (
            <List.Item
              key={idx}
              title={rec}
              titleNumberOfLines={5}
              left={(props) => <List.Icon {...props} icon="check-circle-outline" />}
            />
          ))}
        </AppCard>
      )}

      {/* Anamnez Cevapları */}
      <AppCard title="Anamnez Cevapları">
        {Object.entries(report.anamnesisAnswers).map(([key, value]) => (
          <List.Item
            key={key}
            title={ANAMNESIS_LABELS[key] ?? key}
            description={value?.trim() || 'Belirtilmemiş'}
            descriptionNumberOfLines={4}
            left={(props) => <List.Icon {...props} icon="clipboard-text-outline" />}
          />
        ))}
      </AppCard>

      {/* Uzmanla Paylaş */}
      <AppCard title="Uzman Paylaşımı">
        <Text variant="bodySmall" style={{ marginBottom: 8, opacity: 0.8 }}>
          Bu raporu bir uzmanla paylaşarak değerlendirme alabilirsiniz.
        </Text>
        <AppButton
          label={report.sharedWithExpert ? 'Uzmanla paylaşıldı ✓' : 'Uzmanla Paylaş'}
          onPress={handleShareWithExpert}
          loading={sharing}
          disabled={!!report.sharedWithExpert}
        />
      </AppCard>

      {aiResult?.disclaimer ? (
        <Text variant="bodySmall" style={styles.disclaimer}>
          {aiResult.disclaimer}
        </Text>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  riskChip: {
    alignSelf: 'flex-start',
  },
  disclaimer: {
    opacity: 0.6,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
});

