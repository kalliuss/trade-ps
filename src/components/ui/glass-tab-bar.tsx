import type { TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, radius, space } from '@/constants/theme';

import { GlassView } from './glass';
import { Icon, type IconName } from './icon';
import { Text } from './text';
import { useTheme } from './theme-provider';

/**
 * Altta yüzen cam sekme çubuğu. expo-router/ui ile kullanılır:
 * <TabList asChild><GlassTabBar>{TabTrigger asChild + GlassTabButton}</GlassTabBar></TabList>
 * (TabTrigger'lar layout'ta satır içi yazılmalı; Expo Router onları JSX'ten okur.)
 */
export function GlassTabBar({ children, style, ...rest }: ViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + layout.tabBarMargin }]}>
      <GlassView level={2} radius={radius.pill} style={[style, styles.bar]} {...rest}>
        {children}
      </GlassView>
    </View>
  );
}

type GlassTabButtonProps = TabTriggerSlotProps & {
  icon: IconName;
  label: string;
  /** Yeni istek/mesaj için haki nokta. */
  badge?: boolean;
};

export function GlassTabButton({ icon, label, badge = false, isFocused = false, onPress, onLongPress, ref }: GlassTabButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={badge ? `${label}, yeni` : label}
      accessibilityState={{ selected: isFocused }}
      style={[styles.tab, isFocused && { backgroundColor: colors.inkSoft }]}>
      <View>
        <Icon name={icon} color={isFocused ? colors.ink : colors.ink2} />
        {badge ? (
          <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.bg }]} />
        ) : null}
      </View>
      <Text variant="tab" tone={isFocused ? 'ink' : 'ink2'} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: layout.tabBarMargin,
    right: layout.tabBarMargin,
  },
  bar: {
    flexDirection: 'row',
    height: layout.tabBarHeight,
    padding: layout.tabBarPadding,
  },
  tab: {
    flex: 1,
    minHeight: layout.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxs,
    borderRadius: radius.pill,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: layout.dot + layout.borderWidth * 2,
    height: layout.dot + layout.borderWidth * 2,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
  },
});
