import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { TextInput, Text, Chip, List, ActivityIndicator } from 'react-native-paper';
import { Screen, EmptyState, ErrorState } from '@components/AppPrimitives';
import { useAuthStore } from '@store/authStore';
import { listReportsByPatient } from '@services/reportService';
import type { Report, RiskLevel } from '@types/models';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

type Nav = NativeStackNavigationProp<any>;

function riskLabel(level: string): string {
  if (level === 'high') return 'Yüksek';
  if (level === 'medium') return 'Orta';
  return 'Düşük';
}

export const ReportsListScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<Nav>();
  const [reports, setReports] = useState<Report[]>([]);
  const [filtered, setFiltered] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ekran odağa her geldiğinde listeyi yenile
  useFocusEffect(
    useCallback(() => {
      const run = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
          const list = await listReportsByPatient(user.id);
          setReports(list);
        } catch {
          setError('Raporlar yüklenirken bir hata oluştu.');
        } finally {
          setLoading(false);
        }
      };
      run();
    }, [user]),
  );

  // Filtre her değiştiğinde uygula
  React.useEffect(() => {
    let base = [...reports];
    if (riskFilter !== 'all') {
      base = base.filter((r) => r.aiResult?.riskLevel === riskFilter);
    }
    if (search.trim()) {
      base = base.filter((r) =>
        (r.aiResult?.summary ?? '').toLowerCase().includes(search.trim().toLowerCase()),
      );
    }
    setFiltered(base);
  }, [reports, search, riskFilter]);

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        Analizlerim
      </Text>
      <TextInput
        mode="outlined"
        placeholder="Özet içinde ara"
        value={search}
        onChangeText={setSearch}
        style={{ marginBottom: 8 }}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        <Chip selected={riskFilter === 'all'} onPress={() => setRiskFilter('all')} style={{ marginRight: 4, marginBottom: 4 }}>Tümü</Chip>
        <Chip selected={riskFilter === 'low'} onPress={() => setRiskFilter('low')} style={{ marginRight: 4, marginBottom: 4 }}>Düşük</Chip>
        <Chip selected={riskFilter === 'medium'} onPress={() => setRiskFilter('medium')} style={{ marginRight: 4, marginBottom: 4 }}>Orta</Chip>
        <Chip selected={riskFilter === 'high'} onPress={() => setRiskFilter('high')} style={{ marginBottom: 4 }}>Yüksek</Chip>
      </View>

      {loading && (
        <ActivityIndicator animating style={{ marginTop: 16 }} />
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="Rapor bulunamadı"
          description="Filtreleri temizlemeyi veya yeni bir analiz oluşturmayı deneyin."
        />
      )}

      {!loading && filtered.map((r) => (
        <List.Item
          key={r.id}
          title={r.aiResult?.summary ?? 'Analiz özeti yok'}
          description={`${new Date(r.createdAt).toLocaleString('tr-TR')}  •  Risk: ${riskLabel(r.aiResult?.riskLevel ?? 'low')}`}
          titleNumberOfLines={2}
          onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
          left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          style={{ backgroundColor: '#fff', marginBottom: 4, borderRadius: 8 }}
        />
      ))}
    </Screen>
  );
};

