import { EmptyState, Screen } from '@/components/ui';

// Yer tutucu: kart akışı yol haritasının 3. adımında SwipeDeck ile yapılacak.
export default function KesfetScreen() {
  return (
    <Screen withTabBar title="Keşfet">
      <EmptyState
        title="Kartlar yakında burada."
        description="Takas kartları bir sonraki adımlarda geliyor. Şimdilik profilini düzenleyebilirsin."
      />
    </Screen>
  );
}
