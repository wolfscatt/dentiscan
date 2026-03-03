import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { Screen, AppButton, AppCard } from '@components/AppPrimitives';
import { useAuthStore } from '@store/authStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PatientStackParamList } from '@navigation/patient/PatientNavigator';

type Nav = NativeStackNavigationProp<PatientStackParamList>;

export const PatientProfileScreen: React.FC = () => {
  const { user, logout, loading } = useAuthStore();
  const navigation = useNavigation<Nav>();

  return (
    <Screen>
      <Text variant="titleLarge" style={styles.title}>
        Profil
      </Text>

      <AppCard>
        <List.Item
          title="Ad Soyad"
          description={user?.name ?? '-'}
          left={(p) => <List.Icon {...p} icon="account" />}
        />
        <Divider />
        <List.Item
          title="E-posta"
          description={user?.email ?? '-'}
          left={(p) => <List.Icon {...p} icon="email" />}
        />
        <Divider />
        <List.Item
          title="Rol"
          description="Hasta"
          left={(p) => <List.Icon {...p} icon="account-heart" />}
        />
      </AppCard>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Gizlilik
        </Text>
        <Text variant="bodySmall" style={styles.sectionText}>
          Fotoğraflar ve raporlar bu uygulamada sadece bu cihazda, yerel veritabanında tutulur.
          Yine de demo amaçlıdır ve gerçek hasta verisi içermemelidir.
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton label="Çıkış Yap" onPress={logout} loading={loading} mode="outlined" />
        <AppButton
          label="Geri Bildirim Gönder"
          onPress={() => navigation.navigate('Feedback')}
          mode="text"
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionText: {
    opacity: 0.8,
  },
  actions: {
    marginTop: 24,
  },
});

