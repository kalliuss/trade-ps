import { Easing } from 'react-native-reanimated';

import { motion } from '@/constants/theme';

/** Sitenin easing'i: cubic-bezier(0.22, 1, 0.36, 1). */
export const ease = Easing.bezier(...motion.easing);
