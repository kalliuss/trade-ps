import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fontScale, layout, radius, space, typography } from '@/constants/theme';

import { Text } from './text';
import { useTheme } from './theme-provider';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  /** Hatanın yerine görünen kısa yardım metni. */
  hint?: string;
};

export function TextField({ label, error, hint, style, multiline, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.accent : colors.line2;

  return (
    <View style={styles.wrapper}>
      <Text variant="caption" tone="ink2">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={colors.ink2}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        maxFontSizeMultiplier={fontScale.body}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          typography.body,
          styles.input,
          multiline && styles.multiline,
          { backgroundColor: colors.bgRaised, color: colors.ink, borderColor },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="bodySm" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="bodySm" tone="ink2">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space.xs,
  },
  input: {
    minHeight: layout.touchMin,
    borderRadius: radius.card,
    borderWidth: layout.borderWidth,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  multiline: {
    minHeight: layout.touchMin * 2,
    textAlignVertical: 'top',
  },
});
