import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { Screen, AppButton } from '@components/AppPrimitives';
import { useAuthStore } from '@store/authStore';

const schema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
});

type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ route }) => {
  const { role } = route.params;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const { loginMock, loading } = useAuthStore();

  const onSubmit = (values: FormValues) => {
    loginMock({ ...values, role });
  };

  return (
    <Screen>
      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        {role === 'patient' ? 'Hasta Girişi' : 'Uzman Girişi'}
      </Text>
      <Text variant="bodyMedium" style={{ marginBottom: 16, opacity: 0.8 }}>
        Demo amaçlı basit bir giriş ekranı. Bilgileriniz cihazınızda mock olarak tutulur.
      </Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Ad Soyad"
            mode="outlined"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.name?.message && (
        <Text variant="bodySmall" style={{ color: 'red', marginBottom: 8 }}>
          {errors.name.message}
        </Text>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="E-posta"
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.email?.message && (
        <Text variant="bodySmall" style={{ color: 'red', marginBottom: 8 }}>
          {errors.email.message}
        </Text>
      )}

      <AppButton label="Giriş Yap" onPress={handleSubmit(onSubmit)} loading={loading} />
    </Screen>
  );
};

