import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/authStore';
import { AuthNavigator } from '@navigation/auth/AuthNavigator';
import { PatientNavigator } from '@navigation/patient/PatientNavigator';
import { ExpertNavigator } from '@navigation/expert/ExpertNavigator';
import { ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';

export type RootStackParamList = {
  Auth: undefined;
  PatientApp: undefined;
  ExpertApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'patient' ? (
        <Stack.Screen name="PatientApp" component={PatientNavigator} />
      ) : (
        <Stack.Screen name="ExpertApp" component={ExpertNavigator} />
      )}
    </Stack.Navigator>
  );
};

