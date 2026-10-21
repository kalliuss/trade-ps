import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PillButton, Screen, SegmentedControl, Text, TextField, useTheme, useToast } from '@/components/ui';
import { space } from '@/constants/theme';
import { signOut } from '@/features/auth/api';
import { Avatar } from '@/features/profile/components/avatar';
import { useMyProfile } from '@/features/profile/hooks';
import {
  BIO_MAX,
  DISPLAY_NAME_MAX,
  USERNAME_MAX,
  validateBio,
  validateDisplayName,
  validateUsername,
} from '@/features/profile/validation';
import { useSubmit } from '@/hooks/use-submit';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Açık' },
  { value: 'dark', label: 'Koyu' },
] as const;

export default function ProfilScreen() {
  const { profile, save, changeAvatar } = useMyProfile();
  const { preference, setPreference } = useTheme();
  const toast = useToast();
  const [username, setUsername] = useState(profile?.username ?? '');
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const saving = useSubmit();
  const avatar = useSubmit();
  const leaving = useSubmit();

  if (!profile) return null;

  const handleSave = async () => {
    const problem =
      validateUsername(username.trim()) ??
      validateDisplayName(displayName.trim()) ??
      validateBio(bio.trim());
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError(null);
    const result = await saving.run(() =>
      save({
        username: username.trim(),
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      }),
    );
    if (result) toast('Profilin kaydedildi.', 'success');
  };

  // Seçici de run içinde: izin reddi ya da native hata sade Türkçe mesaja döner.
  const handlePickAvatar = () =>
    avatar.run(async () => {
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (picked.canceled || picked.assets.length === 0) return;
      const asset = picked.assets[0];
      await changeAvatar({ uri: asset.uri, mimeType: asset.mimeType });
    });

  const handleSignOut = () => {
    Alert.alert('Çıkış yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış yap', style: 'destructive', onPress: () => void leaving.run(() => signOut()) },
    ]);
  };

  const ratingText =
    profile.rating_count > 0
      ? `Puan ${profile.rating_avg.toFixed(1)} (${profile.rating_count})`
      : 'Henüz puanın yok';

  return (
    <Screen withTabBar>
      <View style={styles.identity}>
        <Avatar uri={profile.avatar_url} name={profile.username} />
        <Text variant="title" accessibilityRole="header">
          {profile.display_name || profile.username}
        </Text>
        <Text variant="bodySm" tone="ink2">
          @{profile.username} · {ratingText}
        </Text>
        <PillButton
          title="Fotoğrafı değiştir"
          variant="outline"
          size="sm"
          onPress={handlePickAvatar}
          loading={avatar.submitting}
        />
        {avatar.error ? (
          <Text variant="bodySm" tone="danger" accessibilityLiveRegion="polite">
            {avatar.error}
          </Text>
        ) : null}
      </View>

      <Text variant="caption" tone="ink2" style={styles.section}>
        Bilgilerin
      </Text>
      <TextField
        label="Kullanıcı adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={USERNAME_MAX}
      />
      <TextField
        label="Görünen ad"
        value={displayName}
        onChangeText={setDisplayName}
        maxLength={DISPLAY_NAME_MAX}
      />
      <TextField
        label="Hakkında"
        value={bio}
        onChangeText={setBio}
        multiline
        maxLength={BIO_MAX}
        error={formError ?? saving.error}
      />
      <PillButton title="Kaydet" onPress={handleSave} loading={saving.submitting} />

      <Text variant="caption" tone="ink2" style={styles.section}>
        Görünüm
      </Text>
      <SegmentedControl
        accessibilityLabel="Tema"
        options={THEME_OPTIONS}
        value={preference}
        onChange={setPreference}
      />

      {__DEV__ ? (
        <PillButton
          title="Tasarım önizleme"
          variant="outline"
          onPress={() => router.push('/tasarim')}
        />
      ) : null}

      <View style={styles.section}>
        <PillButton
          title="Çıkış yap"
          variant="danger"
          onPress={handleSignOut}
          loading={leaving.submitting}
        />
      </View>
      {leaving.error ? (
        <Text variant="bodySm" tone="danger" accessibilityLiveRegion="polite">
          {leaving.error}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    alignItems: 'center',
    gap: space.xs,
  },
  section: {
    marginTop: space.lg,
  },
});
