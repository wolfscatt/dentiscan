import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '@features/auth/WelcomeScreen';
import { LoginScreen } from '@features/auth/LoginScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { role: 'patient' | 'expert' };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Giriş Yap' }}
      />
    </Stack.Navigator>
  );
};

