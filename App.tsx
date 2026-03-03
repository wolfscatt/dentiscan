import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppTheme } from '@ui/theme';
import { RootNavigator } from '@navigation/RootNavigator';

export default function App() {
  return (
    <PaperProvider theme={AppTheme}>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

