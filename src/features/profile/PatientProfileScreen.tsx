import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { Screen, AppButton } from '@components/AppPrimitives';
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
      <View style={styles.card}>
        <List.Item title="Ad Soyad" description={user?.name ?? '-'} left={(p) => <List.Icon {...p} icon="account" />} />
        <Divider />
        <List.Item title="E-posta" description={user?.email ?? '-'} left={(p) => <List.Icon {...p} icon="email" />} />
        <Divider />
        <List.Item
          title="Rol"
          description={user?.role === 'patient' ? 'Hasta' : 'Uzman'}
          left={(p) => <List.Icon {...p} icon="badge-account-horizontal" />}
        />
      </View>

      <View style={{ marginTop: 24 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Gizlilik
        </Text>
        <Text variant="bodySmall" style={{ opacity: 0.8 }}>
          Fotoğraflar ve raporlar bu uygulamada sadece bu cihazda, yerel veritabanında tutulur.
          Yine de demo amaçlıdır ve gerçek hasta verisi içermemelidir.
        </Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <AppButton label="Çıkış Yap" onPress={logout} loading={loading} mode="outlined" />
      </View>

      <View style={{ marginTop: 8 }}>
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
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});

