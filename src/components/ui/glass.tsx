import { BlurTargetView, BlurView } from 'expo-blur';
import {
  GlassView as NativeGlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { glass, layout, radius, type GlassLevel } from '@/constants/theme';

import { useTheme } from './theme-provider';

// iOS 26+ ve API'si gerçekten olan cihazlarda sistem liquid glass'ı.
const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

/**
 * Android'de blur, arkadaki içeriğin BlurTarget ile işaretlenmesini ister.
 * Sağlayıcı hem BlurTarget'ı hem onun üstündeki GlassView'ları sarmalar;
 * GlassView asla kendi BlurTarget'ının içinde olmaz.
 */
export function BlurTargetProvider({ children }: { children: ReactNode }) {
  const ref = useRef<View>(null);
  return <BlurTargetContext.Provider value={ref}>{children}</BlurTargetContext.Provider>;
}

export function BlurTarget({ children, ...rest }: ViewProps) {
  const ref = useContext(BlurTargetContext);
  if (Platform.OS === 'android' && ref) {
    return (
      <BlurTargetView ref={ref} {...rest}>
        {children}
      </BlurTargetView>
    );
  }
  return <View {...rest}>{children}</View>;
}

export type GlassMode = 'liquid' | 'blur' | 'solid';

/** Bu cihazda camın nasıl çizileceği (önizleme ekranı da gösterir). */
export function useGlassMode(): GlassMode {
  const { reduceTransparency } = useTheme();
  const target = useContext(BlurTargetContext);

  if (reduceTransparency) return 'solid';
  if (Platform.OS === 'ios') return liquidGlass ? 'liquid' : 'blur';
  if (
    Platform.OS === 'android' &&
    typeof Platform.Version === 'number' &&
    Platform.Version >= glass.androidMinApi &&
    target
  ) {
    return 'blur';
  }
  return 'solid';
}

export type GlassViewProps = ViewProps & {
  level?: GlassLevel;
  radius?: number;
};

/** Cam yüzey. Seviye: 1 chip/küçük yüzey, 2 çubuk/başlık/fotoğraf üstü, 3 alt sayfa/modal. */
export function GlassView({
  level = 1,
  radius: cornerRadius = radius.card,
  style,
  children,
  ...rest
}: GlassViewProps) {
  const { colors, scheme } = useTheme();
  const mode = useGlassMode();
  const target = useContext(BlurTargetContext);
  const tint = level === 1 ? colors.glass1 : level === 2 ? colors.glass2 : colors.glass3;
  const frame = {
    borderRadius: cornerRadius,
    borderWidth: layout.borderWidth,
    borderColor: colors.line2,
  };

  if (mode === 'liquid') {
    return (
      <NativeGlassView
        glassEffectStyle="regular"
        tintColor={tint}
        colorScheme={scheme}
        style={[frame, styles.clip, style]}
        {...rest}>
        {children}
      </NativeGlassView>
    );
  }

  if (mode === 'solid') {
    return (
      <View style={[frame, styles.clip, { backgroundColor: colors.bgRaised }, style]} {...rest}>
        {children}
      </View>
    );
  }

  const highlightInset = Math.min(cornerRadius, layout.iconSize);

  return (
    <View style={[frame, styles.clip, style]} {...rest}>
      <BlurView
        intensity={glass.blurIntensity[level]}
        tint={scheme}
        blurMethod={glass.androidBlurMethod}
        blurTarget={Platform.OS === 'android' && target ? target : undefined}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, styles.passThrough, { backgroundColor: tint }]} />
      <View
        style={[
          styles.highlight,
          styles.passThrough,
          { left: highlightInset, right: highlightInset, backgroundColor: colors.glassHighlight },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // BlurView borderRadius uygulamaz; köşeyi kapsayıcı keser.
  clip: {
    overflow: 'hidden',
  },
  passThrough: {
    pointerEvents: 'none',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    height: layout.borderWidth,
  },
});
