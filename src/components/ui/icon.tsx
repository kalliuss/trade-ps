import type { ReactNode } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { layout } from '@/constants/theme';

// Projeye özel çizilmiş, 24'lük ızgarada 1.5 çizgili ikonlar.
const SHAPES = {
  kesfet: (
    <>
      <Rect x={4} y={6.5} width={12} height={14.5} rx={2.5} />
      <Path d="M8 3h9.5A2.5 2.5 0 0 1 20 5.5V17" />
    </>
  ),
  istekler: (
    <>
      <Path d="M4 8h15M15 4l4 4-4 4" />
      <Path d="M20 16H5M9 12l-4 4 4 4" />
    </>
  ),
  mesajlar: (
    <Path d="M6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V17h-.5A2.5 2.5 0 0 1 4 14.5v-8A2.5 2.5 0 0 1 6.5 4z" />
  ),
  envanter: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Circle cx={12} cy={12} r={2.5} />
    </>
  ),
  profil: (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4.5 20.5c.8-3.7 3.9-6 7.5-6s6.7 2.3 7.5 6" />
    </>
  ),
  x: <Path d="M6 6l12 12M18 6L6 18" />,
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  arrowUpRight: <Path d="M7 17L17 7M8.5 7H17v8.5" />,
  chevronLeft: <Path d="M15 5l-7 7 7 7" />,
  star: <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  pin: (
    <>
      <Path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <Circle cx={12} cy={10} r={2.3} />
    </>
  ),
  camera: (
    <>
      <Path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z" />
      <Circle cx={12} cy={12.5} r={3.5} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof SHAPES;

type IconProps = {
  name: IconName;
  color: string;
  size?: number;
};

export function Icon({ name, color, size = layout.iconSize }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <G
        fill="none"
        stroke={color}
        strokeWidth={layout.iconStroke}
        strokeLinecap="round"
        strokeLinejoin="round">
        {SHAPES[name]}
      </G>
    </Svg>
  );
}
