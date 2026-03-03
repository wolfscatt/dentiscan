import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTheme } from '@ui/theme';
import { RootNavigator } from '@navigation/RootNavigator';
import { runMigrations } from '@services/db';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    runMigrations()
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={AppTheme}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppTheme}>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

