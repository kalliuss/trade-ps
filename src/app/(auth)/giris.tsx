import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PillButton, Screen, Text, TextField } from '@/components/ui';
import { space } from '@/constants/theme';
import { signInWithEmail } from '@/features/auth/api';
import { useSubmit } from '@/hooks/use-submit';

export default function GirisScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { run, submitting, error, setError } = useSubmit();

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError('E-posta ve parolanı gir.');
      return;
    }
    // Başarılı girişte oturum değişir ve yönlendirme kök layout tarafından yapılır.
    void run(() => signInWithEmail(email, password));
  };

  return (
    <Screen centered>
      <View style={styles.header}>
        <Text variant="eyebrow" tone="accent">
          PS Takas
        </Text>
        <Text variant="display" accessibilityRole="header">
          Oyunlarını <Text variant="displayStrong">takasla</Text>.
        </Text>
        <Text tone="ink2">Para yok, kargo yok. Devam etmek için giriş yap.</Text>
      </View>

      <TextField
        label="E-posta"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        textContentType="emailAddress"
      />
      <TextField
        label="Parola"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleSubmit}
        error={error}
      />

      <PillButton title="Giriş yap" icon="arrowUpRight" onPress={handleSubmit} loading={submitting} />
      <PillButton
        title="Hesabın yok mu? Kayıt ol"
        variant="outline"
        onPress={() => router.push('/kayit')}
        disabled={submitting}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: space.sm,
    marginBottom: space.lg,
  },
});
