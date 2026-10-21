import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { EmptyState, fontSources, Screen, ThemeProvider, ToastProvider, useTheme } from '@/components/ui';
import { AuthProvider } from '@/features/auth/components/auth-provider';
import { useSession } from '@/features/auth/hooks';
import { ProfileProvider } from '@/features/profile/components/profile-provider';
import { useMyProfile } from '@/features/profile/hooks';
import { isPlaceholderUsername } from '@/features/profile/validation';

// Oturum, profil, tema tercihi ve fontlar yüklenene kadar açılış ekranı görünür kalır.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ProfileProvider>
              <RootNavigator />
            </ProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { scheme, colors, ready: themeReady } = useTheme();
  const [fontsLoaded, fontError] = useFonts(fontSources);
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading, error, refresh } = useMyProfile();

  // Font yüklenemezse sistem fontuyla devam edilir; uygulama açılmaya devam eder.
  const ready = !sessionLoading && !profileLoading && themeReady && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.bg,
      card: colors.bg,
      text: colors.ink,
      border: colors.line,
      notification: colors.danger,
    },
  };

  let content;
  if (!ready) {
    content = (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.ink2} accessibilityLabel="Yükleniyor" />
      </View>
    );
  } else if (session && !profile) {
    content = (
      <Screen centered>
        <EmptyState
          eyebrow="Hata"
          tone="danger"
          title="Profil yüklenemedi"
          description={error ?? 'Bir şeyler ters gitti. Tekrar dener misin?'}
          actionLabel="Tekrar dene"
          onAction={refresh}
        />
      </Screen>
    );
  } else {
    const signedIn = session !== null;
    const needsOnboarding = signedIn && profile !== null && isPlaceholderUsername(profile.username);
    content = (
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={needsOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !needsOnboarding}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        {/* Sadece geliştirmede: tüm bileşenleri iki temada görmek için. */}
        <Stack.Protected guard={__DEV__}>
          <Stack.Screen name="tasarim" />
        </Stack.Protected>
      </Stack>
    );
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {content}
    </NavigationThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
