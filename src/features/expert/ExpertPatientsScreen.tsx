import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Screen, EmptyState, ErrorState } from '@components/AppPrimitives';
import { Text, TextInput, List } from 'react-native-paper';
import { listSharedReports } from '@services/reportService';
import type { Report } from '@types/models';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExpertStackParamList } from '@navigation/expert/ExpertNavigator';

type Nav = NativeStackNavigationProp<ExpertStackParamList>;

interface PatientGroup {
  patientId: string;
  reports: Report[];
}

export const ExpertPatientsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [groups, setGroups] = useState<PatientGroup[]>([]);
  const [filtered, setFiltered] = useState<PatientGroup[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const shared = await listSharedReports();
        const map = new Map<string, Report[]>();
        shared.forEach((r) => {
          const arr = map.get(r.patientId) ?? [];
          arr.push(r);
          map.set(r.patientId, arr);
        });
        const groupsArr: PatientGroup[] = Array.from(map.entries()).map(([patientId, reports]) => ({
          patientId,
          reports: reports.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
        }));
        setGroups(groupsArr);
        setFiltered(groupsArr);
      } catch {
        setError('Paylaşılan raporlar yüklenemedi.');
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(groups);
    } else {
      setFiltered(
        groups.filter((g) =>
          g.patientId.toLowerCase().includes(search.trim().toLowerCase()),
        ),
      );
    }
  }, [groups, search]);

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
        Hastalar (Mock)
      </Text>
      <TextInput
        mode="outlined"
        placeholder="Hasta ID ile ara"
        value={search}
        onChangeText={setSearch}
        style={{ marginBottom: 8 }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Paylaşılan rapor bulunamadı"
          description="Hastalar 'Uzmanla paylaş' butonunu kullandığında burada görünecektir."
        />
      ) : (
        filtered.map((g) => (
          <View key={g.patientId}>
            <List.Subheader>{`Hasta ${g.patientId}`}</List.Subheader>
            {g.reports.map((r) => (
              <List.Item
                key={r.id}
                title={new Date(r.createdAt).toLocaleString()}
                description={`Risk: ${r.aiResult.riskLevel} — ${r.aiResult.summary}`}
                onPress={() =>
                  navigation.navigate('ExpertReportDetail', {
                    reportId: r.id,
                  })
                }
                left={(props) => <List.Icon {...props} icon="file-search-outline" />}
              />
            ))}
          </View>
        ))
      )}
    </Screen>
  );
};

