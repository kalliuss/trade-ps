import { EmptyState, Screen } from '@/components/ui';

// Yer tutucu: sohbet yol haritasının 6. adımında yapılacak.
export default function MesajlarScreen() {
  return (
    <Screen withTabBar title="Mesajlar">
      <EmptyState
        title="Henüz mesajın yok."
        description="Bir takas isteği kabul edilince sohbet burada açılır."
      />
    </Screen>
  );
}
