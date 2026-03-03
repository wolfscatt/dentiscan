import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { Button, Card, Text, ActivityIndicator, useTheme } from 'react-native-paper';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({ children, scroll = true, style }) => {
  const Container = scroll ? ScrollView : View;
  const theme = useTheme();
  return (
    <View style={[styles.screenRoot, { backgroundColor: theme.colors.background }]}>
      <Container contentContainerStyle={styles.screenContent} style={!scroll ? styles.flex : undefined}>
        {children}
      </Container>
    </View>
  );
};

interface AppButtonProps {
  label: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  loading?: boolean;
  disabled?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  mode = 'contained',
  loading,
  disabled,
}) => (
  <Button
    mode={mode}
    onPress={onPress}
    loading={loading}
    disabled={disabled || loading}
    style={styles.button}
    contentStyle={styles.buttonContent}
  >
    {label}
  </Button>
);

interface AppCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({ title, subtitle, children, onPress }) => (
  <Card style={styles.card} onPress={onPress}>
    <Card.Content>
      {title && (
        <Text variant="titleMedium" style={styles.cardTitle}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text variant="bodyMedium" style={styles.cardSubtitle}>
          {subtitle}
        </Text>
      )}
      {children}
    </Card.Content>
  </Card>
);

interface EmptyStateProps {
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => (
  <View style={styles.stateContainer}>
    <Text variant="titleMedium" style={styles.stateTitle}>
      {title}
    </Text>
    {description ? (
      <Text variant="bodyMedium" style={styles.stateDescription}>
        {description}
      </Text>
    ) : null}
  </View>
);

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => (
  <View style={styles.stateContainer}>
    <Text variant="titleMedium" style={styles.stateTitle}>
      Bir şeyler ters gitti
    </Text>
    <Text variant="bodyMedium" style={styles.stateDescription}>
      {message}
    </Text>
  </View>
);

export const LoadingOverlay: React.FC = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator />
  </View>
);

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  screenContent: {
    padding: 16,
  },
  flex: {
    flex: 1,
  },
  button: {
    borderRadius: 999,
    marginVertical: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  card: {
    borderRadius: 16,
    marginVertical: 8,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardSubtitle: {
    marginBottom: 8,
    opacity: 0.8,
  },
  stateContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  stateTitle: {
    marginBottom: 8,
  },
  stateDescription: {
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

