import { Children, type ReactNode } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { fontScale, typography, type Palette, type TextVariant } from '@/constants/theme';

import { useTheme } from './theme-provider';

export type TextTone = 'ink' | 'ink2' | 'ink3' | 'accent' | 'success' | 'danger' | 'onInk';

const HEADINGS: readonly TextVariant[] = ['display', 'displayStrong', 'title', 'headline', 'stamp'];

function toneColor(colors: Palette, tone: TextTone) {
  switch (tone) {
    case 'ink':
      return colors.ink;
    case 'ink2':
      return colors.ink2;
    case 'ink3':
      return colors.ink3;
    case 'accent':
      return colors.accentInk;
    case 'success':
      return colors.successInk;
    case 'danger':
      return colors.dangerInk;
    case 'onInk':
      return colors.onInk;
  }
}

// RN'nin textTransform'u Türkçe "i"yi "I" yapar; büyük harfi tr-TR kuralıyla biz çeviririz (i → İ).
function upperTr(children: ReactNode) {
  return Children.map(children, (child) =>
    typeof child === 'string' ? child.toLocaleUpperCase('tr-TR') : child,
  );
}

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

/**
 * Tüm metinler bu bileşenle yazılır. Vurgulu kelime için iç içe kullan:
 * <Text variant="display">Takas <Text variant="displayStrong">başlasın</Text></Text>
 */
export function Text({ variant = 'body', tone = 'ink', style, children, ...rest }: TextProps) {
  const { colors } = useTheme();
  const token = typography[variant];
  const isHeading = HEADINGS.includes(variant);
  const uppercase = 'textTransform' in token && token.textTransform === 'uppercase';

  return (
    <RNText
      maxFontSizeMultiplier={isHeading ? fontScale.heading : fontScale.body}
      style={[token, uppercase && { textTransform: 'none' }, { color: toneColor(colors, tone) }, style]}
      {...rest}>
      {uppercase ? upperTr(children) : children}
    </RNText>
  );
}
