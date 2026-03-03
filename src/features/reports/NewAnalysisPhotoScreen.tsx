import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text, SegmentedButtons } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PatientStackParamList } from '@navigation/patient/PatientNavigator';
import { Screen, AppButton, ErrorState } from '@components/AppPrimitives';
import { analyzeDentalPhoto } from '@services/aiService';

type Props = NativeStackScreenProps<PatientStackParamList, 'NewAnalysis'>;

export const NewAnalysisPhotoScreen: React.FC<Props> = ({ navigation }) => {
  const [mode, setMode] = useState<'mock' | 'api'>('mock');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFromLibrary = async () => {
    setError(null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0]?.uri ?? null);
    }
  };

  const takePhoto = async () => {
    setError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Kamera izni gerekli. Lütfen ayarlardan izin verin.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0]?.uri ?? null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) {
      setError('Lütfen önce bir fotoğraf seçin veya çekin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Şimdilik sadece mock servis kullanılıyor; mode==='api' olduğunda da aynı fonksiyona gidiyor.
      await analyzeDentalPhoto(imageUri);
      navigation.navigate('AnalysisResult', { imageUri });
    } catch (e) {
      setError('Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        Dental Fotoğraf
      </Text>
      <Text variant="bodyMedium" style={{ marginBottom: 16, opacity: 0.85 }}>
        Dişlerinizi net gösteren bir fotoğraf çekin veya galerinizden seçin. Fotoğraf sadece bu
        cihazda mock analiz için kullanılacaktır.
      </Text>

      <SegmentedButtons
        value={mode}
        onValueChange={(val) => setMode(val as 'mock' | 'api')}
        style={{ marginBottom: 16 }}
        buttons={[
          { value: 'mock', label: 'Mock Analiz', icon: 'beaker-outline' },
          { value: 'api', label: 'API (varsa)', icon: 'cloud-outline' },
        ]}
      />

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
        </View>
      ) : (
        <Text variant="bodySmall" style={{ marginBottom: 16, opacity: 0.7 }}>
          Henüz fotoğraf seçilmedi.
        </Text>
      )}

      <AppButton label="Galeriden Seç" onPress={pickFromLibrary} mode="outlined" />
      <AppButton label="Kamera ile Çek" onPress={takePhoto} mode="outlined" />

      <View style={{ marginTop: 16 }}>
        <AppButton label="Analiz Et" onPress={handleAnalyze} loading={loading} />
      </View>

      {error && <ErrorState message={error} />}
    </Screen>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
});

