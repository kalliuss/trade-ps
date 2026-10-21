import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Appearance, Platform, useColorScheme } from 'react-native';

import { palette, type ColorScheme, type Palette, type ThemePreference } from '@/constants/theme';

const STORAGE_KEY = 'ps-takas:theme-preference';

type ThemeContextValue = {
  /** Çözülmüş tema (sistem tercihi uygulanmış). */
  scheme: ColorScheme;
  colors: Palette;
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** Kayıtlı tercih okundu mu (açılış ekranı bunu bekler). */
  ready: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

// Klavye, Alert gibi native parçalar da seçilen temayı kullansın. State'ten önce, eş zamanlı
// çağrılır: "Sistem"e dönüşte useColorScheme ilk render'da zaten gerçek sistem temasını verir.
function applyNativeScheme(preference: ThemePreference) {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}

function useReduceMotion() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setEnabled(value))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return enabled;
}

// "Saydamlığı azalt" sadece iOS'ta var; Android'de cam geri dönüşü API sürümüne göre seçilir.
function useReduceTransparency() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((value) => active && setEnabled(value))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setEnabled);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return enabled;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);
  const reduceMotion = useReduceMotion();
  const reduceTransparency = useReduceTransparency();

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && isPreference(stored)) {
          applyNativeScheme(stored);
          setPreferenceState(stored);
        }
      })
      // Okunamazsa sistem teması kullanılır.
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setPreference = (next: ThemePreference) => {
    applyNativeScheme(next);
    setPreferenceState(next);
    // Saklanamazsa bu oturumda yine geçerli; bir sonraki açılışta sistem temasına döner.
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  return (
    <ThemeContext.Provider
      value={{
        scheme,
        colors: palette[scheme],
        preference,
        setPreference,
        ready,
        reduceMotion,
        reduceTransparency,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme, ThemeProvider içinde kullanılmalı.');
  return value;
}
