import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, motion, radius, space } from '@/constants/theme';

import { ease } from './motion';
import { Text } from './text';
import { useTheme } from './theme-provider';

export type ToastTone = 'neutral' | 'success' | 'danger';

type ToastState = { id: number; message: string; tone: ToastTone };
type ShowToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast | null>(null);

/** Kısa bildirimler. Kalıcı hata metni yerine kullanılmaz; formdaki hata alanın altında kalır. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const show: ShowToast = (message, tone = 'neutral') => {
    if (timer.current) clearTimeout(timer.current);
    nextId.current += 1;
    setToast({ id: nextId.current, message, tone });
    // Android'de accessibilityLiveRegion okur; iOS'ta live region yok, duyuru gerekir.
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
    timer.current = setTimeout(() => setToast(null), motion.duration.toast);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? <ToastView key={toast.id} message={toast.message} tone={toast.tone} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ message, tone }: Omit<ToastState, 'id'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const dotColor = tone === 'success' ? colors.accent : tone === 'danger' ? colors.danger : null;

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + layout.tabBarSpace }]}>
      <Animated.View
        entering={FadeInDown.duration(motion.duration.transition).easing(ease)}
        exiting={FadeOut.duration(motion.duration.press)}
        accessibilityLiveRegion="polite"
        style={[styles.toast, { backgroundColor: colors.ink }]}>
        {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
        <Text variant="bodySm" tone="onInk">
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast, ToastProvider içinde kullanılmalı.');
  return show;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: layout.screenX,
    right: layout.screenX,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
  },
  dot: {
    width: layout.dot,
    height: layout.dot,
    borderRadius: radius.pill,
  },
});
