import { fontFamily } from '@/constants/theme';

// Sadece kullanılan ağırlıklar paketlenir (paketin index'i 18 dosyanın hepsini yükler).
export const fontSources = {
  [fontFamily.light]: require('@expo-google-fonts/geist/300Light/Geist_300Light.ttf'),
  [fontFamily.regular]: require('@expo-google-fonts/geist/400Regular/Geist_400Regular.ttf'),
  [fontFamily.medium]: require('@expo-google-fonts/geist/500Medium/Geist_500Medium.ttf'),
  [fontFamily.semiBold]: require('@expo-google-fonts/geist/600SemiBold/Geist_600SemiBold.ttf'),
  [fontFamily.mono]: require('@expo-google-fonts/geist-mono/400Regular/GeistMono_400Regular.ttf'),
  [fontFamily.monoMedium]: require('@expo-google-fonts/geist-mono/500Medium/GeistMono_500Medium.ttf'),
};
