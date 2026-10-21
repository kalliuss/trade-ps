import { EmptyState, Screen } from '@/components/ui';

// Yer tutucu: oyun ekleme yol haritasının 2. adımında yapılacak.
export default function EnvanterimScreen() {
  return (
    <Screen withTabBar title="Envanterim">
      <EmptyState
        title="Henüz oyun eklemedin."
        description="İlk oyununu ekleyerek başla. Oyun ekleme çok yakında burada."
      />
    </Screen>
  );
}
