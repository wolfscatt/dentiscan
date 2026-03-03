import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text, List } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PatientStackParamList } from '@navigation/patient/PatientNavigator';
import { Screen, AppButton, LoadingOverlay, ErrorState, AppCard } from '@components/AppPrimitives';
import { analyzeDentalPhoto } from '@services/aiService';
import { useAnalysisStore } from '@store/analysisStore';
import { RiskLevel } from '@types/models';

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

export const AnalysisResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const { lastResult, setResult } = useAnalysisStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!lastResult);

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

  if (loading && !lastResult) {
    return (
      <Screen>
        <Text>Analiz yapılıyor, lütfen bekleyin...</Text>
        <LoadingOverlay />
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

      <AppCard title="Bulgular">
        {lastResult.findings.map((f, idx) => (
          <List.Item
            key={idx}
            title={f.title}
            description={`${f.note}\nGüven skoru: ${(f.confidence * 100).toFixed(0)}%`}
            left={(props) => <List.Icon {...props} icon="tooth-outline" />}
          />
        ))}
      </AppCard>

      <AppCard title="Öneriler">
        {lastResult.recommendations.map((rec, idx) => (
          <List.Item
            key={idx}
            title={rec}
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

