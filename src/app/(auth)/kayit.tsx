import { router } from 'expo-router';
import { useState } from 'react';

import { EmptyState, PillButton, Screen, TextField } from '@/components/ui';
import { signUpWithEmail } from '@/features/auth/api';
import { useSubmit } from '@/hooks/use-submit';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

export default function KayitScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { run, submitting, error } = useSubmit();

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFormError('Geçerli bir e-posta adresi gir.');
      return;
    }
    if (password.length < PASSWORD_MIN) {
      setFormError(`Parola en az ${PASSWORD_MIN} karakter olmalı.`);
      return;
    }
    if (password !== passwordAgain) {
      setFormError('Parolalar aynı değil.');
      return;
    }
    setFormError(null);

    const result = await run(() => signUpWithEmail(trimmed, password));
    // Doğrulama kapalıysa oturum açılır ve kök layout yönlendirir; açıksa kullanıcıyı bilgilendir.
    if (result?.needsEmailConfirmation) setConfirmationSent(true);
  };

  if (confirmationSent) {
    return (
      <Screen centered>
        <EmptyState
          eyebrow="Son bir adım"
          title="E-postanı kontrol et."
          description={`${email.trim()} adresine bir doğrulama bağlantısı gönderdik. Bağlantıya dokunduktan sonra giriş yapabilirsin.`}
          actionLabel="Giriş ekranına dön"
          onAction={() => router.replace('/giris')}
        />
      </Screen>
    );
  }

  return (
    <Screen centered eyebrow="PS Takas" title="Kayıt ol">
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
        autoComplete="new-password"
        textContentType="newPassword"
        hint={`En az ${PASSWORD_MIN} karakter.`}
      />
      <TextField
        label="Parola (tekrar)"
        value={passwordAgain}
        onChangeText={setPasswordAgain}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={handleSubmit}
        error={formError ?? error}
      />

      <PillButton title="Kayıt ol" icon="arrowUpRight" onPress={handleSubmit} loading={submitting} />
      <PillButton
        title="Zaten hesabın var mı? Giriş yap"
        variant="outline"
        onPress={() => router.replace('/giris')}
        disabled={submitting}
      />
    </Screen>
  );
}
