import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { TextInput, Text, Chip, List } from 'react-native-paper';
import { Screen, EmptyState, ErrorState } from '@components/AppPrimitives';
import { useAuthStore } from '@store/authStore';
import { listReportsByPatient } from '@services/reportService';
import type { Report, RiskLevel } from '@types/models';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type Nav = NativeStackNavigationProp<any>;

export const ReportsListScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<Nav>();
  const [reports, setReports] = useState<Report[]>([]);
  const [filtered, setFiltered] = useState<Report[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const list = await listReportsByPatient(user.id);
        setReports(list);
        setFiltered(list);
      } catch {
        setError('Raporlar yüklenirken bir hata oluştu.');
      }
    };
    run();
  }, [user]);

  useEffect(() => {
    let base = [...reports];
    if (riskFilter !== 'all') {
      base = base.filter((r) => r.aiResult.riskLevel === riskFilter);
    }
    if (search.trim()) {
      base = base.filter((r) =>
        r.aiResult.summary.toLowerCase().includes(search.trim().toLowerCase()),
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
    <Screen>
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

      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Chip
          selected={riskFilter === 'all'}
          onPress={() => setRiskFilter('all')}
          style={{ marginRight: 4 }}
        >
          Tümü
        </Chip>
        <Chip
          selected={riskFilter === 'low'}
          onPress={() => setRiskFilter('low')}
          style={{ marginRight: 4 }}
        >
          Düşük
        </Chip>
        <Chip
          selected={riskFilter === 'medium'}
          onPress={() => setRiskFilter('medium')}
          style={{ marginRight: 4 }}
        >
          Orta
        </Chip>
        <Chip selected={riskFilter === 'high'} onPress={() => setRiskFilter('high')}>
          Yüksek
        </Chip>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title="Rapor bulunamadı"
          description="Filtreleri temizlemeyi veya yeni bir analiz oluşturmayı deneyin."
        />
      ) : (
        filtered.map((r) => (
          <List.Item
            key={r.id}
            title={new Date(r.createdAt).toLocaleString()}
            description={r.aiResult.summary}
            onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          />
        ))
      )}
    </Screen>
  );
};

