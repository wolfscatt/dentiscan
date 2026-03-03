import React from 'react';
import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, Text, HelperText, Banner } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@navigation/auth/AuthNavigator';
import { Screen, AppButton } from '@components/AppPrimitives';
import { useAuthStore } from '@store/authStore';

const schema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(4, 'Şifre en az 4 karakter olmalı'),
});

type FormValues = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ route }) => {
  const { role } = route.params;
  const { login, loading, loginError } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = (values: FormValues) => {
    login({ ...values, role });
  };

  return (
    <Screen scroll>
      <Text variant="titleLarge" style={{ marginBottom: 4 }}>
        {role === 'patient' ? 'Hasta Girişi' : 'Uzman Girişi'}
      </Text>
      <Text variant="bodyMedium" style={{ marginBottom: 16, opacity: 0.8 }}>
        İlk girişte hesabınız oluşturulur. Aynı e-posta ve şifreyle tekrar giriş yaptığınızda
        tüm raporlarınız ve verileriniz korunur.
      </Text>

      {/* Hatalı şifre / genel hata */}
      {loginError ? (
        <Banner
          visible
          icon="alert-circle-outline"
          actions={[]}
          style={{ marginBottom: 12, borderRadius: 8 }}
        >
          {loginError}
        </Banner>
      ) : null}

      {/* Ad Soyad */}
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
            left={<TextInput.Icon icon="account-outline" />}
            error={!!errors.name}
            style={{ marginBottom: 2 }}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.name}>
        {errors.name?.message}
      </HelperText>

      {/* E-posta */}
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
            left={<TextInput.Icon icon="email-outline" />}
            error={!!errors.email}
            style={{ marginBottom: 2 }}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.email}>
        {errors.email?.message}
      </HelperText>

      {/* Şifre */}
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            label="Şifre"
            mode="outlined"
            secureTextEntry={!showPassword}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setShowPassword((p) => !p)}
              />
            }
            error={!!errors.password}
            style={{ marginBottom: 2 }}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.password}>
        {errors.password?.message}
      </HelperText>

      <View style={{ marginTop: 8 }}>
        <AppButton label="Giriş Yap / Kayıt Ol" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>

      <Text variant="bodySmall" style={{ marginTop: 16, opacity: 0.6, textAlign: 'center' }}>
        Aynı e-posta daha önce kullanıldıysa şifrenizle tekrar giriş yapın.{'\n'}
        İlk girişte hesabınız otomatik oluşturulur.
      </Text>
    </Screen>
  );
};

