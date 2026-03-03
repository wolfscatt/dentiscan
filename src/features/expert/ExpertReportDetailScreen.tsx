import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, List, Chip, ActivityIndicator } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ExpertStackParamList } from '@navigation/expert/ExpertNavigator';
import { Screen, AppButton, AppCard, ErrorState } from '@components/AppPrimitives';
import { getReport, updateReport } from '@services/reportService';
import type { AiFinding, Report } from '@types/models';

const ANAMNESIS_LABELS: Record<string, string> = {
  pain: 'Ağrı / Hassasiyet',
  bleeding: 'Diş Eti Kanaması',
  duration: 'Şikayet Süresi',
  medical: 'Tıbbi Geçmiş',
};

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

function mapFindingToDisplay(f: AiFinding): { title: string; description: string } {
  switch (f.title) {
    case 'Calculus':
      return { title: 'Diş Taşı (Calculus)', description: 'Diş yüzeylerinde sertleşmiş plak birikimi olabilir.' };
    case 'Caries':
      return { title: 'Çürük (Caries)', description: 'Mine kaybı veya başlangıç çürük alanları olabilir.' };
    case 'Gingivitis':
      return { title: 'Diş Eti İltihabı (Gingivitis)', description: 'Diş etlerinde kızarıklık, şişlik veya kanama riski olabilir.' };
    case 'Mouth Ulcer':
      return { title: 'Aft / Ağız İçi Yara', description: 'Ağız içinde hassasiyet veya yüzeysel yaralar görülebilir.' };
    case 'Tooth Discoloration':
      return { title: 'Diş Renklenmesi', description: 'Bazı dişlerde renk değişikliği veya lekelenmeler olabilir.' };
    case 'hypodontia':
      return { title: 'Doğuştan Eksik Diş (Hypodontia)', description: 'Bazı dişlerin doğuştan eksik olma olasılığı vardır.' };
    default:
      return { title: f.title, description: 'Diş görüntüsünde dikkat çeken bir bulgu saptandı.' };
  }
}

type Props = NativeStackScreenProps<ExpertStackParamList, 'ExpertReportDetail'>;

export const ExpertReportDetailScreen: React.FC<Props> = ({ route }) => {
  const { reportId } = route.params;
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await getReport(reportId);
        if (!r) {
          setError('Rapor bulunamadı.');
          return;
        }
        setReport(r);
        setNote(r.expertNote ?? '');
      } catch {
        setError('Rapor yüklenirken hata oluştu.');
      }
    };
    run();
  }, [reportId]);

  const handleSaveNote = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updated = await updateReport(report.id, { expertNote: note });
      if (updated) setReport(updated);
    } finally {
      setSaving(false);
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
        Rapor İnceleme
      </Text>
      <Text variant="bodySmall" style={{ marginBottom: 12, opacity: 0.7 }}>
        {new Date(report.createdAt).toLocaleString('tr-TR')}
      </Text>

      {/* Analiz Özeti + Risk */}
      <AppCard title="Analiz Özeti">
        <Text variant="bodyMedium" style={{ marginBottom: 10 }}>
          {aiResult?.summary ?? 'Özet bulunamadı.'}
        </Text>
        <Chip
          style={{ alignSelf: 'flex-start', backgroundColor: riskColor(aiResult?.riskLevel ?? 'low') }}
          textStyle={{ color: '#fff' }}
          selected
          showSelectedCheck={false}
        >
          Risk: {riskLabel(aiResult?.riskLevel ?? 'low')}
        </Chip>
      </AppCard>

      {/* DentiScan Yorumu */}
      {report.interpretation ? (
        <AppCard title="DentiScan Yorumu">
          <Text variant="bodyMedium">{report.interpretation}</Text>
        </AppCard>
      ) : null}

      {/* Bulgular — Türkçe açıklamalarla */}
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
                  descriptionNumberOfLines={4}
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
              titleNumberOfLines={4}
              left={(props) => <List.Icon {...props} icon="check-circle-outline" />}
            />
          ))}
        </AppCard>
      )}

      {/* Anamnez — Türkçe etiketlerle */}
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

      {/* Uzman Notu */}
      <View style={styles.noteSection}>
        <Text variant="titleMedium" style={{ marginBottom: 4 }}>
          Uzman Notu / Öneri
        </Text>
        <TextInput
          mode="outlined"
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="Hastaya iletmek istediğiniz notunuzu yazın..."
          style={{ marginBottom: 8 }}
        />
        <AppButton label="Notu Kaydet" onPress={handleSaveNote} loading={saving} />
      </View>
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
  noteSection: {
    marginTop: 16,
  },
});

