import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, List, Chip } from 'react-native-paper';
import type { PatientStackParamList } from '@navigation/patient/PatientNavigator';
import { Screen, AppCard, EmptyState, ErrorState, AppButton } from '@components/AppPrimitives';
import { getReport, updateReport } from '@services/reportService';
import type { Report } from '@types/models';

type Props = NativeStackScreenProps<PatientStackParamList, 'ReportDetail'>;

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
        <EmptyState title="Yükleniyor..." />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        Rapor Detayı
      </Text>
      <Text variant="bodySmall" style={{ marginBottom: 8, opacity: 0.8 }}>
        {new Date(report.createdAt).toLocaleString()}
      </Text>

      <View style={styles.imageContainer}>
        <Image source={{ uri: report.imageUri }} style={styles.image} />
      </View>

      <AppCard title="Analiz Özeti">
        <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
          {report.aiResult.summary}
        </Text>
        <Chip
          style={{ alignSelf: 'flex-start' }}
          selected
          showSelectedCheck={false}
          icon={
            report.aiResult.riskLevel === 'high'
              ? 'alert-circle-outline'
              : report.aiResult.riskLevel === 'medium'
                ? 'alert-outline'
                : 'check-circle-outline'
          }
        >
          Risk: {report.aiResult.riskLevel}
        </Chip>
      </AppCard>

      <AppCard title="Anamnez Cevapları">
        {Object.entries(report.anamnesisAnswers).map(([key, value]) => (
          <List.Item
            key={key}
            title={key}
            description={value || 'Belirtilmemiş'}
            left={(props) => <List.Icon {...props} icon="clipboard-text-outline" />}
          />
        ))}
      </AppCard>

      <AppCard title="Paylaşım">
        <Text variant="bodySmall" style={{ marginBottom: 8, opacity: 0.8 }}>
          Bu raporu uzman ile paylaştığınızda cihazınızdaki uzman görünümünde bu rapor listelenir.
        </Text>
        <AppButton
          label={report.sharedWithExpert ? 'Uzmanla paylaşıldı' : 'Uzmanla paylaş'}
          onPress={handleShareWithExpert}
          loading={sharing}
          disabled={report.sharedWithExpert}
        />
      </AppCard>
    </Screen>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
});

