import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, AppCard, AppButton } from '@components/AppPrimitives';
import { Text, List, Divider } from 'react-native-paper';
import { useAuthStore } from '@store/authStore';

export const ExpertProfileScreen: React.FC = () => {
  const { user, logout, loading } = useAuthStore();

  return (
    <Screen>
      <Text variant="titleLarge" style={styles.title}>
        Uzman Profili
      </Text>

      <AppCard>
        <List.Item
          title="Ad Soyad"
          description={user?.name ?? '-'}
          left={(p) => <List.Icon {...p} icon="account-tie" />}
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
          description="Uzman"
          left={(p) => <List.Icon {...p} icon="stethoscope" />}
        />
      </AppCard>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Hasta Paylaşımları
        </Text>
        <Text variant="bodySmall" style={styles.sectionText}>
          Hastalar raporlarını uzmanla paylaştığında, bu cihazdaki uzman görünümünde listelenir.
          Rapor notlarınız ve önerileriniz yalnızca bu cihazda saklanır.
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton label="Çıkış Yap" onPress={logout} loading={loading} mode="outlined" />
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
    marginTop: 32,
  },
});

