import { useState } from 'react';

import { PillButton, Screen, Text, TextField } from '@/components/ui';
import { signOut } from '@/features/auth/api';
import { useMyProfile } from '@/features/profile/hooks';
import { USERNAME_MAX, validateUsername } from '@/features/profile/validation';
import { useSubmit } from '@/hooks/use-submit';

export default function OnboardingScreen() {
  const { save } = useMyProfile();
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { run, submitting, error } = useSubmit();

  const handleSubmit = () => {
    const value = username.trim();
    const problem = validateUsername(value);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    // Kaydedilince profil güncellenir ve kök layout seni uygulamaya yönlendirir.
    void run(() => save({ username: value }));
  };

  return (
    <Screen centered eyebrow="Hoş geldin" title="Kullanıcı adını seç">
      <Text tone="ink2">Diğer kullanıcılar seni bu adla görecek.</Text>

      <TextField
        label="Kullanıcı adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={USERNAME_MAX}
        onSubmitEditing={handleSubmit}
        hint="3-20 karakter; harf, rakam ve _ kullanabilirsin."
        error={formError ?? error}
      />

      <PillButton title="Devam et" icon="arrowUpRight" onPress={handleSubmit} loading={submitting} />
      <PillButton
        title="Çıkış yap"
        variant="outline"
        onPress={() => void run(() => signOut())}
        disabled={submitting}
      />
    </Screen>
  );
}
