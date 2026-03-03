import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { Screen, AppCard } from '@components/AppPrimitives';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          DentiScan
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Dental fotoğraf analizi ve akıllı anamnez desteği. Klinik kararınızı destekleyen, modern ve
          güvenli bir yardımcı.
        </Text>
      </View>

      <AppCard title="Gizlilik ve Uyarı">
        <Text variant="bodyMedium" style={styles.bodyText}>
          DentiScan, diş fotoğraflarını ve raporları cihazınızda yerel olarak (SQLite veritabanında)
          saklar. Sonuçlar yine de sadece bilgilendirme amaçlıdır; bir diş hekimi muayenesinin yerini
          almaz.
        </Text>
        <Text variant="bodySmall" style={[styles.bodyText, { marginTop: 8 }]}>
          Bu uygulama tıbbi tanı koymaz. Klinik değerlendirme için mutlaka bir diş hekimine
          başvurunuz.
        </Text>
      </AppCard>

      <View style={styles.roleContainer}>
        <Text variant="titleMedium" style={styles.roleTitle}>
          Rolünüzü seçin
        </Text>
        <Chip
          style={styles.chip}
          mode="flat"
          selectedColor={theme.colors.onPrimary}
          onPress={() => navigation.navigate('Login', { role: 'patient' })}
        >
          Hasta olarak devam et
        </Chip>
        <Chip
          style={styles.chip}
          mode="outlined"
          onPress={() => navigation.navigate('Login', { role: 'expert' })}
        >
          Uzman olarak devam et
        </Chip>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.85,
  },
  bodyText: {
    opacity: 0.9,
  },
  roleContainer: {
    marginTop: 24,
  },
  roleTitle: {
    marginBottom: 8,
  },
  chip: {
    marginVertical: 6,
  },
});

