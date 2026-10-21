import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { layout, motion, radius, space } from '@/constants/theme';

import { Icon, type IconName } from './icon';
import { ease } from './motion';
import { Text } from './text';
import { useTheme } from './theme-provider';

type PillButtonProps = {
  title: string;
  onPress: () => void;
  /** solid: ana eylem · outline: ikincil · danger: geri alınamaz eylem (çıkış, sil). */
  variant?: 'solid' | 'outline' | 'danger';
  size?: 'md' | 'sm';
  /** Sadece solid: sağda daire içinde ikon (sitedeki ok düğmesi). */
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
};

const SM_HEIGHT = layout.touchMin - space.xs;
const SM_SLOP = (layout.touchMin - SM_HEIGHT) / 2;

export function PillButton({
  title,
  onPress,
  variant = 'solid',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  accessibilityHint,
}: PillButtonProps) {
  const { colors, reduceMotion } = useTheme();
  const pressed = useSharedValue(0);
  const inactive = disabled || loading;
  const showIcon = variant === 'solid' && icon !== undefined;

  const look = {
    solid: { bg: colors.ink, border: colors.ink, text: 'onInk' as const, spinner: colors.onInk },
    outline: { bg: colors.glass1, border: colors.line2, text: 'ink' as const, spinner: colors.ink },
    danger: { bg: 'transparent', border: colors.dangerBorder, text: 'danger' as const, spinner: colors.dangerInk },
  }[variant];

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : 1 - (1 - motion.pressScale) * pressed.get() }],
  }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: pressed.get() }));

  const animateTo = (value: number) => {
    pressed.set(withTiming(value, { duration: motion.duration.press, easing: ease }));
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      hitSlop={size === 'sm' ? SM_SLOP : undefined}
      style={inactive && styles.inactive}>
      <Animated.View style={scaleStyle}>
        {/* Basılı durum halkası (sitedeki hover halkasının mobil karşılığı). */}
        <Animated.View style={[styles.ring, { backgroundColor: colors.accentSoft }, ringStyle]} />
        <View
          style={[
            styles.body,
            {
              height: size === 'md' ? layout.buttonHeight : SM_HEIGHT,
              backgroundColor: look.bg,
              borderColor: look.border,
              paddingRight: showIcon ? space.xs : space.lg,
            },
          ]}>
          {loading ? (
            <ActivityIndicator color={look.spinner} />
          ) : (
            <>
              <Text variant="label" tone={look.text} numberOfLines={1}>
                {title}
              </Text>
              {showIcon ? (
                <View style={[styles.iconCircle, { backgroundColor: colors.bg }]}>
                  <Icon name={icon} color={colors.ink} size={layout.iconSizeSm} />
                </View>
              ) : null}
            </>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingLeft: space.lg,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
  },
  ring: {
    position: 'absolute',
    top: -space.xxs,
    bottom: -space.xxs,
    left: -space.xxs,
    right: -space.xxs,
    borderRadius: radius.pill,
  },
  iconCircle: {
    width: layout.buttonIconCircle,
    height: layout.buttonIconCircle,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  inactive: {
    opacity: layout.disabledOpacity,
  },
});
