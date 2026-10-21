import { statusTone, type SwapStatus } from '@/constants/theme';

import { Chip } from './chip';

const LABELS: Record<SwapStatus, string> = {
  pending: 'Bekliyor',
  accepted: 'Kabul edildi',
  completed: 'Tamamlandı',
  declined: 'Reddedildi',
  cancelled: 'İptal edildi',
};

/** Takas durumunu her yerde aynı renk ve metinle gösterir. */
export function StatusBadge({ status }: { status: SwapStatus }) {
  return <Chip label={LABELS[status]} tone={statusTone[status]} dot />;
}
