import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TextInput, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PatientStackParamList } from '@navigation/patient/PatientNavigator';
import { Screen, AppButton } from '@components/AppPrimitives';
import { useAnalysisStore } from '@store/analysisStore';
import { useAuthStore } from '@store/authStore';
import { createReport } from '@services/reportService';
import type { Report } from '@types/models';
import { incrementAnalysisCount } from '@utils/analyticsService';

const schema = z.object({
  pain: z.string().optional(),
  bleeding: z.string().optional(),
  duration: z.string().optional(),
  medical: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<PatientStackParamList, 'AnamnesisForm'>;

export const AnamnesisFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const { lastResult, lastInterpretation } = useAnalysisStore();
  const { user } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (!lastResult || !user) {
    return (
      <Screen>
        <Text>Analiz veya kullanıcı bilgisi bulunamadı.</Text>
      </Screen>
    );
  }

  const onSubmit = async (values: FormValues) => {
    const id = `${Date.now()}`;
    const report: Report = {
      id,
      patientId: user.id,
      createdAt: new Date().toISOString(),
      imageUri,
      aiResult: lastResult,
      anamnesisAnswers: {
        pain: values.pain ?? '',
        bleeding: values.bleeding ?? '',
        duration: values.duration ?? '',
        medical: values.medical ?? '',
      },
      // Analiz ekranında gösterilen LLM/yerleşik yorumu rapora kaydet
      interpretation: lastInterpretation ?? undefined,
      sharedWithExpert: false,
    };

    // Kayıt denemesi – SQLite tarafı bozulsa bile akışı bloklamasın
    try {
      await createReport(report);
      await incrementAnalysisCount();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Rapor kaydedilirken hata oluştu (yoksayılıyor)', e);
    }

    // Her durumda hasta ana sayfasına dön
    navigation.reset({
      index: 0,
      routes: [{ name: 'PatientTabs' }],
    });
  };

  return (
    <Screen>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        Anamnez
      </Text>
      <Text variant="bodyMedium" style={{ marginBottom: 16, opacity: 0.8 }}>
        Aşağıdaki sorular, otomatik analiz sonucuna göre oluşturulmuştur. Lütfen mümkün olduğunca
        detaylı cevaplayın.
      </Text>

      <Field
        control={control}
        name="pain"
        label={lastResult.anamnesis.pain.questions.join(' / ')}
      />
      <Field
        control={control}
        name="bleeding"
        label={lastResult.anamnesis.bleeding.questions.join(' / ')}
      />
      <Field
        control={control}
        name="duration"
        label={lastResult.anamnesis.duration.questions.join(' / ')}
      />
      <Field
        control={control}
        name="medical"
        label={lastResult.anamnesis.medical.questions.join(' / ')}
      />

      <View style={{ marginTop: 16 }}>
        <AppButton
          label="Raporu Kaydet"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </View>
    </Screen>
  );
};

interface FieldProps {
  control: any;
  name: keyof FormValues;
  label: string;
}

const Field: React.FC<FieldProps> = ({ control, name, label }) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { value, onChange, onBlur } }) => (
      <TextInput
        label={label}
        mode="outlined"
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        multiline
        style={{ marginBottom: 12 }}
      />
    )}
  />
);

