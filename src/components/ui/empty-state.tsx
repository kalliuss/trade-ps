import { StyleSheet, View } from 'react-native';

import { space } from '@/constants/theme';

import { PillButton } from './pill-button';
import { Text } from './text';

type EmptyStateProps = {
  title: string;
  description?: string;
  /** Üst başlık (mono, büyük harf). Hata ekranında tone="danger" ile kırmızı. */
  eyebrow?: string;
  tone?: 'neutral' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
};

/** Boş liste, hata ve "yakında" durumları için ortak görünüm. */
export function EmptyState({
  title,
  description,
  eyebrow,
  tone = 'neutral',
  actionLabel,
  onAction,
  actionLoading,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {eyebrow ? (
        <Text variant="eyebrow" tone={tone === 'danger' ? 'danger' : 'accent'}>
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="title" style={styles.center} accessibilityRole="header">
        {title}
      </Text>
      {description ? (
        <Text tone="ink2" style={styles.center}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PillButton title={actionLabel} onPress={onAction} loading={actionLoading} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xl,
  },
  center: {
    textAlign: 'center',
  },
  action: {
    marginTop: space.sm,
  },
});
