import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = {
  ...configureFonts({}),
};

const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#0EA5E9',
  secondary: '#22C55E',
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceVariant: '#E2E8F0',
  error: '#EF4444',
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#38BDF8',
  secondary: '#4ADE80',
  background: '#020617',
  surface: '#020617',
  surfaceVariant: '#0F172A',
  error: '#F97373',
};

export const LightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: lightColors,
  fonts: fontConfig,
};

export const DarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: darkColors,
  fonts: fontConfig,
};

export const AppTheme: MD3Theme = LightTheme;

