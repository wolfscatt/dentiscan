import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, List, Chip, Divider } from 'react-native-paper';
import { Screen, AppButton, AppCard, EmptyState } from '@components/AppPrimitives';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@store/authStore';
import { getAnalytics } from '@utils/analyticsService';
import { listReportsByPatient } from '@services/reportService';
import type { Report } from '@types/models';

interface AnalyticsState {
  totalAnalyses: number;
  lastAnalysisAt: string | null;
}

type Nav = NativeStackNavigationProp<any>;

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

export const PatientHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = React.useState<AnalyticsState | null>(null);
  const [recentReports, setRecentReports] = React.useState<Report[]>([]);

  // Ekran odağa geldiğinde hem analitiği hem son raporları yenile
  useFocusEffect(
    React.useCallback(() => {
      const run = async () => {
        const [a, reports] = await Promise.all([
          getAnalytics(),
          user ? listReportsByPatient(user.id) : Promise.resolve([]),
        ]);
        setAnalytics(a);
        setRecentReports(reports.slice(0, 5));
      };
      run();
    }, [user]),
  );

  return (
    <Screen scroll>
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
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Son Raporlar
        </Text>

        {recentReports.length === 0 ? (
          <EmptyState
            title="Henüz rapor yok"
            description="İlk dental analizinizle başlayın, sonuçlar burada görünecek."
          />
        ) : (
          <AppCard title="">
            {recentReports.map((r, idx) => (
              <React.Fragment key={r.id}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
                  style={styles.reportRow}
                  activeOpacity={0.7}
                >
                  <View style={styles.reportLeft}>
                    <Text variant="bodyMedium" numberOfLines={2} style={styles.reportSummary}>
                      {r.aiResult?.summary ?? 'Analiz özeti yok'}
                    </Text>
                    <Text variant="bodySmall" style={styles.reportDate}>
                      {new Date(r.createdAt).toLocaleString('tr-TR')}
                    </Text>
                  </View>
                  <Chip
                    compact
                    style={{ backgroundColor: riskColor(r.aiResult?.riskLevel ?? 'low') }}
                    textStyle={{ color: '#fff', fontSize: 11 }}
                  >
                    {riskLabel(r.aiResult?.riskLevel ?? 'low')}
                  </Chip>
                </TouchableOpacity>
                {idx < recentReports.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </AppCard>
        )}
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
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  reportLeft: {
    flex: 1,
    marginRight: 8,
  },
  reportSummary: {
    marginBottom: 2,
  },
  reportDate: {
    opacity: 0.6,
  },
});

