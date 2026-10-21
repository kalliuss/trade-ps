import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { layout, motion, radius, space } from '@/constants/theme';

import { Chip } from './chip';
import { BlurTarget, BlurTargetProvider, GlassView } from './glass';
import { Icon } from './icon';
import { Text } from './text';
import { useTheme } from './theme-provider';

export type GameCardProps = {
  title: string;
  /** "PS5" / "PS4" */
  platform: string;
  /** Okunur durum etiketi, ör. "Çok iyi". */
  condition?: string;
  cover: ImageSource | null;
  username: string;
  rating: { avg: number; count: number } | null;
  /** Kaba aralık, ör. "3 km'den yakın". Koordinat asla. */
  distanceLabel?: string | null;
  /** Sahibinin çektiği disk fotoğrafı sayısı (güven unsuru). */
  photoCount: number;
  onPressPhotos?: () => void;
  /** Destede üstteki kart: cam blur sadece onda (ekranda en fazla 2 blur). */
  live?: boolean;
};

export function GameCard({
  title,
  platform,
  condition,
  cover,
  username,
  rating,
  distanceLabel,
  photoCount,
  onPressPhotos,
  live = true,
}: GameCardProps) {
  const { colors } = useTheme();

  const details = (
    <>
      <Text variant="headline" numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.row}>
        <Chip label={platform} onImage />
        {condition ? <Chip label={condition} onImage /> : null}
      </View>
      <View style={styles.row}>
        <Text variant="bodySm" numberOfLines={1} style={styles.shrink}>
          @{username}
        </Text>
        <View style={styles.meta}>
          <Icon name="star" color={colors.ink} size={layout.iconSizeSm} />
          <Text variant="caption">
            {rating && rating.count > 0 ? `${rating.avg.toFixed(1)} (${rating.count})` : 'Yeni'}
          </Text>
        </View>
        {distanceLabel ? (
          <View style={styles.meta}>
            <Icon name="pin" color={colors.ink} size={layout.iconSizeSm} />
            <Text variant="caption">{distanceLabel}</Text>
          </View>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.bgRaised, borderColor: colors.line2 }]}>
      <BlurTargetProvider>
        <BlurTarget style={StyleSheet.absoluteFill}>
          {cover ? (
            <Image source={cover} style={StyleSheet.absoluteFill} contentFit="cover" transition={motion.duration.transition} />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="envanter" color={colors.ink3} size={layout.placeholderIcon} />
            </View>
          )}
        </BlurTarget>

        {photoCount > 0 ? (
          <Pressable
            onPress={onPressPhotos}
            disabled={!onPressPhotos}
            accessibilityRole="button"
            accessibilityLabel={`Sahibinin çektiği ${photoCount} gerçek fotoğrafı gör`}
            hitSlop={PHOTO_BADGE_SLOP}
            style={[styles.photoBadge, { backgroundColor: colors.glass3, borderColor: colors.line2 }]}>
            <Icon name="camera" color={colors.ink} size={layout.iconSizeSm} />
            <Text variant="micro">Gerçek fotoğraf · {photoCount}</Text>
          </Pressable>
        ) : null}

        {live ? (
          <GlassView level={2} radius={radius.sheet} style={styles.panel}>
            {details}
          </GlassView>
        ) : (
          <View style={[styles.panel, styles.panelSolid, { backgroundColor: colors.glass3, borderColor: colors.line2 }]}>
            {details}
          </View>
        )}
      </BlurTargetProvider>
    </View>
  );
}

// Rozet ~24 yüksek (dolgu 4+4, satır 14, kenarlık 2); dikeyde 12+12 ile 48'e tamamlanır.
const PHOTO_BADGE_SLOP = { top: space.sm, bottom: space.sm, left: space.xs, right: space.xs };

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.deck,
    borderWidth: layout.borderWidth,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadge: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.chipGap,
    paddingVertical: space.xxs,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
  },
  // Dış yarıçap 28, 8 içeride 20: köşeler eş merkezli.
  panel: {
    position: 'absolute',
    left: space.xs,
    right: space.xs,
    bottom: space.xs,
    padding: layout.cardPadding,
    gap: space.xs,
  },
  panelSolid: {
    borderRadius: radius.sheet,
    borderWidth: layout.borderWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
  },
  shrink: {
    flexShrink: 1,
  },
});
