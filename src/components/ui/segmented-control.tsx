import { Pressable, StyleSheet, View } from 'react-native';

import { layout, radius, space } from '@/constants/theme';

import { Text } from './text';
import { useTheme } from './theme-provider';

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

const ITEM_HEIGHT = layout.touchMin - space.xs;

/** Hap içinde hap seçici (sitedeki gezinme hapı). Ör. tema: Sistem / Açık / Koyu. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.group, { borderColor: colors.line2, backgroundColor: colors.glass1 }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            hitSlop={{ top: space.xxs, bottom: space.xxs }}
            style={[styles.item, selected && { backgroundColor: colors.inkSoft }]}>
            <Text variant="label" tone={selected ? 'ink' : 'ink2'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    padding: space.xxs,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
  },
  item: {
    flex: 1,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
