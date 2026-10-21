import { StyleSheet, View } from 'react-native';

import { layout, radius } from '@/constants/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';
import { useTheme } from './theme-provider';

export type ChipTone = 'neutral' | 'success' | 'danger';

type ChipProps = {
  label: string;
  tone?: ChipTone;
  /** Solda küçük durum noktası. */
  dot?: boolean;
  icon?: IconName;
  /** Fotoğraf/cam üstünde: nötr yazı ink2 yerine ink (kontrast). */
  onImage?: boolean;
};

export function Chip({ label, tone = 'neutral', dot = false, icon, onImage = false }: ChipProps) {
  const { colors } = useTheme();

  const look = {
    neutral: { text: onImage ? ('ink' as const) : ('ink2' as const), color: onImage ? colors.ink : colors.ink2, border: colors.line2, bg: 'transparent' },
    success: { text: 'success' as const, color: colors.successInk, border: colors.successBorder, bg: colors.successSoft },
    danger: { text: 'danger' as const, color: colors.dangerInk, border: colors.dangerBorder, bg: colors.dangerSoft },
  }[tone];

  return (
    <View style={[styles.chip, { borderColor: look.border, backgroundColor: look.bg }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: look.color }]} /> : null}
      {icon ? <Icon name={icon} color={look.color} size={layout.iconSizeSm} /> : null}
      <Text variant="micro" tone={look.text} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: layout.chipGap,
    paddingVertical: layout.chipPaddingY,
    paddingHorizontal: layout.chipPaddingX,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
  },
  dot: {
    width: layout.dot,
    height: layout.dot,
    borderRadius: radius.pill,
  },
});
