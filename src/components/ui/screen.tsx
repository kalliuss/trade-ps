import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, radius, space } from '@/constants/theme';

import { Icon } from './icon';
import { Text } from './text';
import { useTheme } from './theme-provider';

type ScreenProps = {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  /** Altta GlassTabBar varsa içerik çubuğun arkasından kayar ama sonu görünür kalır. */
  withTabBar?: boolean;
  /** İçeriği dikeyde ortala (giriş, boş durum). */
  centered?: boolean;
  /** false: kaydırma yok (kart destesi gibi tam ekran içerik). */
  scroll?: boolean;
  onBack?: () => void;
};

/** Her ekranın kabuğu: zemin, güvenli alan, klavye, kenar boşlukları, başlık. */
export function Screen({
  children,
  title,
  eyebrow,
  withTabBar = false,
  centered = false,
  scroll = true,
  onBack,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: insets.top + space.lg,
    paddingBottom: insets.bottom + (withTabBar ? layout.tabBarSpace : space.lg),
  };

  const header =
    onBack || title ? (
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Geri"
            style={[styles.back, { borderColor: colors.line2 }]}>
            <Icon name="chevronLeft" color={colors.ink} />
          </Pressable>
        ) : null}
        {eyebrow ? (
          <Text variant="eyebrow" tone="accent">
            {eyebrow}
          </Text>
        ) : null}
        {title ? (
          <Text variant="display" accessibilityRole="header">
            {title}
          </Text>
        ) : null}
      </View>
    ) : null;

  const body = (
    <View style={[styles.inner, !centered && styles.flex]}>
      {header}
      {children}
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.content, padding, centered && styles.centered]}>
            {body}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content, padding, centered && styles.centered]}>{body}</View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.screenX,
  },
  centered: {
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: space.md,
  },
  header: {
    gap: space.xs,
    marginBottom: space.xs,
  },
  back: {
    width: layout.touchMin,
    height: layout.touchMin,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
});
