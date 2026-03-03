import React from 'react';
import { Screen } from '@components/AppPrimitives';
import { Text } from 'react-native-paper';
import { useAuthStore } from '@store/authStore';

export const ExpertProfileScreen: React.FC = () => {
  const { user } = useAuthStore();
  return (
    <Screen>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        Uzman Profili
      </Text>
      <Text variant="bodyMedium">
        {user?.name} ({user?.email})
      </Text>
      <Text variant="bodySmall" style={{ marginTop: 16, opacity: 0.8 }}>
        Bu MVP sürümünde uzman tarafında temel profil ve hasta listesi placeholder olarak
        sunulmaktadır. İlerleyen adımlarda rapor inceleme ve not ekleme akışları eklenecektir.
      </Text>
    </Screen>
  );
};

