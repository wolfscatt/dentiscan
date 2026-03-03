import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Screen, AppButton, AppCard, EmptyState } from '@components/AppPrimitives';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@store/authStore';
import { getAnalytics } from '@utils/analyticsService';

interface AnalyticsState {
  totalAnalyses: number;
  lastAnalysisAt: string | null;
}

type Nav = NativeStackNavigationProp<any>;

export const PatientHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = React.useState<AnalyticsState | null>(null);

  React.useEffect(() => {
    const run = async () => {
      const a = await getAnalytics();
      setAnalytics(a);
    };
    run();
  }, []);

  return (
    <Screen>
      <Text variant="headlineSmall" style={styles.title}>
        Merhaba, {user?.name ?? 'Hasta'}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Yeni bir dental fotoğraf analizi başlatın veya önceki raporlarınızı inceleyin.
      </Text>

      <AppCard title="Yeni Analiz Başlat" subtitle="Dental foto çek veya galeriden yükle.">
        <AppButton
          label="Yeni Analiz"
          onPress={() => navigation.navigate('NewAnalysis')}
        />
      </AppCard>

      {analytics && (
        <AppCard title="Analiz İstatistikleri">
          <Text variant="bodyMedium">
            Toplam analiz: {analytics.totalAnalyses}
          </Text>
          <Text variant="bodySmall" style={{ marginTop: 4, opacity: 0.8 }}>
            Son analiz:{' '}
            {analytics.lastAnalysisAt
              ? new Date(analytics.lastAnalysisAt).toLocaleString()
              : 'Henüz analiz yok'}
          </Text>
        </AppCard>
      )}

      <View style={{ marginTop: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 4 }}>
          Son Raporlar
        </Text>
        <EmptyState
          title="Henüz rapor yok"
          description="İlk dental analizinizle başlayın, sonuçlar burada görünecek."
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.85,
  },
});

