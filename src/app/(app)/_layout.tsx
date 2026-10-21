import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { BlurTarget, BlurTargetProvider, GlassTabBar, GlassTabButton } from '@/components/ui';

// Ekranlar cam çubuğun arkasından kayar. Android'de blur, BlurTarget içindeki ekranı bulanıklaştırır.
// TabTrigger'lar burada satır içi kalmalı: Expo Router sekmeleri bu JSX'ten okur.
export default function AppLayout() {
  return (
    <BlurTargetProvider>
      <Tabs style={styles.flex}>
        <BlurTarget style={styles.flex}>
          <TabSlot />
        </BlurTarget>
        <TabList asChild>
          <GlassTabBar>
            <TabTrigger name="index" href="/" asChild>
              <GlassTabButton icon="kesfet" label="Keşfet" />
            </TabTrigger>
            <TabTrigger name="istekler" href="/istekler" asChild>
              <GlassTabButton icon="istekler" label="İstekler" />
            </TabTrigger>
            <TabTrigger name="mesajlar" href="/mesajlar" asChild>
              <GlassTabButton icon="mesajlar" label="Mesajlar" />
            </TabTrigger>
            <TabTrigger name="envanterim" href="/envanterim" asChild>
              <GlassTabButton icon="envanter" label="Envanterim" />
            </TabTrigger>
            <TabTrigger name="profil" href="/profil" asChild>
              <GlassTabButton icon="profil" label="Profil" />
            </TabTrigger>
          </GlassTabBar>
        </TabList>
      </Tabs>
    </BlurTargetProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
