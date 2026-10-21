import { EmptyState, Screen } from '@/components/ui';

// Yer tutucu: gelen/giden istekler yol haritasının 5. adımında yapılacak.
export default function IsteklerScreen() {
  return (
    <Screen withTabBar title="İstekler">
      <EmptyState
        title="Henüz takas isteğin yok."
        description="Keşfet'te beğendiğin oyunu sağa kaydırarak ilk isteğini gönderebilirsin."
      />
    </Screen>
  );
}
