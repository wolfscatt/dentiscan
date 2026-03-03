import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, List } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ExpertStackParamList } from '@navigation/expert/ExpertNavigator';
import { Screen, AppButton, AppCard, EmptyState, ErrorState } from '@components/AppPrimitives';
import { getReport, updateReport } from '@services/reportService';
import type { Report } from '@types/models';

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
        <EmptyState title="Yükleniyor..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        Rapor İnceleme
      </Text>
      <Text variant="bodySmall" style={{ marginBottom: 8, opacity: 0.8 }}>
        Oluşturulma: {new Date(report.createdAt).toLocaleString()} — Risk: {report.aiResult.riskLevel}
      </Text>

      <AppCard title="Analiz Özeti">
        <Text variant="bodyMedium">{report.aiResult.summary}</Text>
      </AppCard>

      <AppCard title="Anamnez">
        {Object.entries(report.anamnesisAnswers).map(([key, value]) => (
          <List.Item
            key={key}
            title={key}
            description={value || 'Belirtilmemiş'}
            left={(props) => <List.Icon {...props} icon="clipboard-text-outline" />}
          />
        ))}
      </AppCard>

      <View style={styles.noteSection}>
        <Text variant="titleMedium" style={{ marginBottom: 4 }}>
          Uzman Notu / Öneri
        </Text>
        <TextInput
          mode="outlined"
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="Bu alan demo amaçlıdır; detaylı tedavi planı yazmayın."
          style={{ marginBottom: 8 }}
        />
        <AppButton label="Notu Kaydet" onPress={handleSaveNote} loading={saving} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  noteSection: {
    marginTop: 16,
  },
});

