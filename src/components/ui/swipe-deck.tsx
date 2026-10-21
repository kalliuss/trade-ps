import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { layout, motion, radius, space } from '@/constants/theme';

import { EmptyState } from './empty-state';
import { Icon } from './icon';
import { ease } from './motion';
import { Text } from './text';
import { useTheme } from './theme-provider';

export type SwipeDirection = 'left' | 'right';

/** Kart içindeki dokunulabilir öğelerin ekran okuyucu karşılığı (ör. "Fotoğrafları gör"). */
export type CardAction = { name: string; label: string; onPress: () => void };

type DeckCardHandle = { swipe: (direction: SwipeDirection) => void };

type DeckCardProps = {
  isTop: boolean;
  label: string;
  actions: readonly CardAction[];
  onSwiped: (direction: SwipeDirection) => void;
  children: ReactNode;
  ref?: Ref<DeckCardHandle>;
};

function DeckCard({ isTop, label, actions, onSwiped, children, ref }: DeckCardProps) {
  const { colors, reduceMotion } = useTheme();
  const { width } = useWindowDimensions();
  const threshold = width * motion.swipe.thresholdRatio;

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const fade = useSharedValue(0);
  const lift = useSharedValue(isTop ? 1 : 0);
  const leaving = useSharedValue(false);

  // Arkadaki kart öne geçince hafifçe büyür.
  useEffect(() => {
    if (isTop) lift.set(withTiming(1, { duration: motion.duration.transition, easing: ease }));
  }, [isTop, lift]);

  const flyOut = (direction: SwipeDirection) => {
    'worklet';
    if (leaving.get()) return;
    leaving.set(true);
    const done = (finished?: boolean) => {
      'worklet';
      if (finished) scheduleOnRN(onSwiped, direction);
    };
    if (reduceMotion) {
      // Hareketi azalt: uçma yerine yerinde solar.
      fade.set(withTiming(1, { duration: motion.duration.press }, done));
    } else {
      const sign = direction === 'right' ? 1 : -1;
      x.set(withTiming(sign * width * motion.swipe.flyOutRatio, { duration: motion.duration.swipeOut, easing: ease }, done));
    }
  };

  useImperativeHandle(ref, () => ({ swipe: flyOut }));

  const pan = Gesture.Pan()
    .enabled(isTop)
    // Yatay hareket başlamadan kart tutulmaz; dikey kaydırma sayfaya kalır.
    .activeOffsetX([-space.xs, space.xs])
    .onUpdate((e) => {
      if (leaving.get()) return;
      x.set(e.translationX);
      y.set(e.translationY);
    })
    .onEnd((e) => {
      if (leaving.get()) return;
      const dx = x.get();
      if (dx > threshold || (e.velocityX > motion.swipe.velocity && dx > 0)) {
        flyOut('right');
      } else if (dx < -threshold || (e.velocityX < -motion.swipe.velocity && dx < 0)) {
        flyOut('left');
      } else {
        x.set(withSpring(0, motion.spring));
        y.set(withSpring(0, motion.spring));
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = reduceMotion
      ? 0
      : interpolate(x.get(), [-width / 2, 0, width / 2], [-motion.swipe.maxRotateDeg, 0, motion.swipe.maxRotateDeg], Extrapolation.CLAMP);
    return {
      opacity: 1 - fade.get(),
      transform: [
        { translateX: x.get() },
        { translateY: y.get() },
        { rotate: `${rotate}deg` },
        { scale: interpolate(lift.get(), [0, 1], [motion.swipe.behindScale, 1]) },
      ],
    };
  });
  const takeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.get(), [0, threshold], [0, 1], Extrapolation.CLAMP),
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.get(), [-threshold, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[StyleSheet.absoluteFill, cardStyle]}
        accessible={isTop}
        accessibilityLabel={label}
        accessibilityActions={[
          { name: 'swipeLeft', label: 'Geç' },
          { name: 'swipeRight', label: 'Takas teklif et' },
          ...actions.map(({ name, label: actionLabel }) => ({ name, label: actionLabel })),
        ]}
        onAccessibilityAction={(e) => {
          const name = e.nativeEvent.actionName;
          if (name === 'swipeLeft' || name === 'swipeRight') {
            flyOut(name === 'swipeRight' ? 'right' : 'left');
            return;
          }
          actions.find((action) => action.name === name)?.onPress();
        }}
        importantForAccessibility={isTop ? 'yes' : 'no-hide-descendants'}>
        {children}
        <Animated.View
          style={[
            styles.stamp,
            styles.stampLeft,
            { borderColor: colors.success, backgroundColor: colors.glass3 },
            takeStyle,
          ]}>
          <Text variant="stamp" tone="success">
            Takas
          </Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.stamp,
            styles.stampRight,
            { borderColor: colors.danger, backgroundColor: colors.glass3 },
            passStyle,
          ]}>
          <Text variant="stamp" tone="danger">
            Geç
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

type SwipeDeckProps<T> = {
  items: readonly T[];
  keyExtractor: (item: T) => string;
  /** Kartın ekran okuyucu etiketi, ör. "God of War, PS5, @kaan". */
  labelExtractor: (item: T) => string;
  renderCard: (item: T, state: { isTop: boolean }) => ReactNode;
  /** Kart uçtuktan sonra çağrılır. RPC hata verirse kartı geri getirmek ekranın işidir. */
  onSwipe: (item: T, direction: SwipeDirection) => void;
  /** Kart içindeki düğmelerin ekran okuyucu eylemleri. */
  cardActions?: (item: T) => readonly CardAction[];
  /** Deste bitince gösterilir. */
  empty?: ReactNode;
};

const NO_ACTIONS: readonly CardAction[] = [];

/**
 * Kart destesi: sağa = takas, sola = geç. Kaydırmaya alternatif ✕ / ✓ düğmeleri her zaman var.
 * Kaydırılanlar anahtarla tutulur: ekran `items`'tan kart çıkarsa ya da sona ekleme yapsa da
 * kart atlanmaz. Desteyi tamamen sıfırlamak için `key` değiştir.
 */
export function SwipeDeck<T>({
  items,
  keyExtractor,
  labelExtractor,
  renderCard,
  onSwipe,
  cardActions,
  empty,
}: SwipeDeckProps<T>) {
  const { colors, reduceMotion } = useTheme();
  const [swiped, setSwiped] = useState<ReadonlySet<string>>(() => new Set());
  const topCard = useRef<DeckCardHandle>(null);

  const visible = items.filter((item) => !swiped.has(keyExtractor(item))).slice(0, 2);
  const top = visible[0];

  if (top === undefined) {
    return (
      <View style={styles.emptyWrap}>
        {empty ?? <EmptyState title="Şimdilik bu kadar." description="Biraz sonra yeni ilanlar gelir." />}
      </View>
    );
  }

  const handleSwiped = (direction: SwipeDirection) => {
    const key = keyExtractor(top);
    onSwipe(top, direction);
    setSwiped((prev) => new Set(prev).add(key));
  };

  const pressedScale = reduceMotion ? undefined : { transform: [{ scale: motion.pressScale }] };

  return (
    <View style={styles.deck}>
      <View style={styles.stack}>
        {[...visible].reverse().map((item) => {
          const isTop = item === top;
          return (
            <DeckCard
              key={keyExtractor(item)}
              ref={isTop ? topCard : undefined}
              isTop={isTop}
              label={labelExtractor(item)}
              actions={cardActions?.(item) ?? NO_ACTIONS}
              onSwiped={handleSwiped}>
              {renderCard(item, { isTop })}
            </DeckCard>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => topCard.current?.swipe('left')}
          accessibilityRole="button"
          accessibilityLabel="Geç"
          style={({ pressed }) => [
            styles.round,
            { borderColor: colors.dangerBorder, backgroundColor: colors.bgRaised },
            pressed && pressedScale,
          ]}>
          <Icon name="x" color={colors.danger} />
        </Pressable>
        <Pressable
          onPress={() => topCard.current?.swipe('right')}
          accessibilityRole="button"
          accessibilityLabel="Takas teklif et"
          style={({ pressed }) => [
            styles.round,
            { borderColor: colors.accent, backgroundColor: colors.accent },
            pressed && pressedScale,
          ]}>
          <Icon name="check" color={colors.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deck: {
    flex: 1,
    gap: space.lg,
  },
  stack: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.xl,
  },
  round: {
    width: layout.swipeButton,
    height: layout.swipeButton,
    borderRadius: radius.pill,
    borderWidth: layout.borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    position: 'absolute',
    top: space.lg,
    paddingVertical: space.xxs,
    paddingHorizontal: space.sm,
    borderRadius: radius.row,
    borderWidth: layout.stampBorder,
  },
  stampLeft: {
    left: space.lg,
    transform: [{ rotate: `-${motion.swipe.stampRotateDeg}deg` }],
  },
  stampRight: {
    right: space.lg,
    transform: [{ rotate: `${motion.swipe.stampRotateDeg}deg` }],
  },
});
