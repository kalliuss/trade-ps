import { Redirect, router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BlurTarget,
  BlurTargetProvider,
  Chip,
  EmptyState,
  GameCard,
  GlassView,
  PillButton,
  Screen,
  SegmentedControl,
  StatusBadge,
  SwipeDeck,
  Text,
  TextField,
  useGlassMode,
  useTheme,
  useToast,
  type GlassMode,
} from '@/components/ui';
import { layout, radius, space, statusTone, typography, type Palette, type SwapStatus, type TextVariant } from '@/constants/theme';

// Sadece geliştirmede açılır (kök layout'ta __DEV__ korumalı). Tüm bileşenleri iki temada görmek için.

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Açık' },
  { value: 'dark', label: 'Koyu' },
] as const;

const SWATCHES: readonly (keyof Palette)[] = [
  'bg', 'bgRaised', 'ink', 'ink2', 'ink3', 'line2', 'accent', 'accentInk', 'accentSoft',
  'danger', 'dangerInk', 'dangerSoft', 'glass1', 'glass2', 'glass3',
];

const GLASS_MODE_LABEL: Record<GlassMode, string> = {
  liquid: 'iOS liquid glass',
  blur: 'Blur (expo-blur)',
  solid: 'Düz zemin (geri dönüş)',
};

type SampleGame = { id: string; title: string; platform: string; condition: string; username: string };

const SAMPLE_GAMES: readonly SampleGame[] = [
  { id: '1', title: 'Örnek Oyun: Uzun Bir Macera', platform: 'PS5', condition: 'Çok iyi', username: 'ornek_1' },
  { id: '2', title: 'Yarış Günleri', platform: 'PS4', condition: 'İyi', username: 'ornek_2' },
  { id: '3', title: 'Sessiz Şehir', platform: 'PS5', condition: 'Yeni gibi', username: 'ornek_3' },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="caption" tone="ink2">
        {title}
      </Text>
      {children}
    </View>
  );
}

function GlassModeLabel() {
  const mode = useGlassMode();
  return <Text variant="caption">{GLASS_MODE_LABEL[mode]}</Text>;
}

// Bu ekrana asla gerçek veri, oturum ya da API çağrısı eklenmez.
export default function TasarimRoute() {
  // Kök layout zaten kapatıyor; bu ikinci kat koruma.
  if (!__DEV__) return <Redirect href="/" />;
  return <TasarimScreen />;
}

function TasarimScreen() {
  const { colors, preference, setPreference, scheme, reduceMotion, reduceTransparency } = useTheme();
  const toast = useToast();
  const [field, setField] = useState('');
  const [deckKey, setDeckKey] = useState(0);

  return (
    <Screen eyebrow="Geliştirme" title="Tasarım" onBack={() => router.back()}>
      <SegmentedControl accessibilityLabel="Tema" options={THEME_OPTIONS} value={preference} onChange={setPreference} />
      <View style={styles.facts}>
        <Text variant="caption" tone="ink2">Tema: {scheme === 'dark' ? 'koyu' : 'açık'}</Text>
        <Text variant="caption" tone="ink2">Hareketi azalt: {reduceMotion ? 'açık' : 'kapalı'}</Text>
        <Text variant="caption" tone="ink2">Saydamlığı azalt: {reduceTransparency ? 'açık' : 'kapalı'}</Text>
      </View>

      <Section title="Renkler">
        <View style={styles.swatches}>
          {SWATCHES.map((name) => (
            <View key={name} style={styles.swatch}>
              <View style={[styles.swatchColor, { backgroundColor: colors[name], borderColor: colors.line2 }]} />
              <Text variant="micro" tone="ink2">{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Yazı">
        {(Object.keys(typography) as TextVariant[]).map((variant) => (
          <Text key={variant} variant={variant}>
            {variant} · Takas ışığı
          </Text>
        ))}
        <Text variant="display">
          Oyunlarını <Text variant="displayStrong">takasla</Text>.
        </Text>
      </Section>

      <Section title="Düğmeler">
        <PillButton title="Takas isteği gönder" icon="arrowUpRight" onPress={() => toast('Takas isteğin gönderildi.', 'success')} />
        <PillButton title="Çerçeveli" variant="outline" onPress={() => {}} />
        <PillButton title="Engelle" variant="danger" onPress={() => {}} />
        <PillButton title="Yükleniyor" onPress={() => {}} loading />
        <PillButton title="Pasif" onPress={() => {}} disabled />
        <PillButton title="Küçük" variant="outline" size="sm" onPress={() => {}} />
      </Section>

      <Section title="Chip ve durum">
        <View style={styles.wrap}>
          <Chip label="PS5" />
          <Chip label="Haki" tone="success" />
          <Chip label="Kırmızı" tone="danger" />
          <Chip label="Çevrimiçi" tone="success" dot />
        </View>
        <View style={styles.wrap}>
          {(Object.keys(statusTone) as SwapStatus[]).map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </View>
      </Section>

      <Section title="Metin alanı">
        <TextField label="Kullanıcı adı" value={field} onChangeText={setField} placeholder="ör. kaan_34" hint="3-20 karakter." />
        <TextField label="E-posta" value="yanlis@" editable={false} error="Geçerli bir e-posta adresi gir." />
      </Section>

      <Section title="Cam">
        <BlurTargetProvider>
          <View style={[styles.glassStage, { borderColor: colors.line2 }]}>
            <BlurTarget style={StyleSheet.absoluteFill}>
              {[colors.accent, colors.ink, colors.danger, colors.bgRaised, colors.accentInk, colors.ink2].map((color, i) => (
                <View key={i} style={[styles.stripe, { backgroundColor: color }]} />
              ))}
            </BlurTarget>
            <View style={styles.glassRow}>
              {([1, 2, 3] as const).map((level) => (
                <GlassView key={level} level={level} style={styles.glassTile}>
                  <Text variant="label">Cam {level}</Text>
                </GlassView>
              ))}
            </View>
          </View>
          <GlassModeLabel />
        </BlurTargetProvider>
      </Section>

      <Section title="Boş ve hata durumu">
        <EmptyState title="Henüz oyun eklemedin." description="İlk oyununu ekleyerek başla." actionLabel="Oyun ekle" onAction={() => {}} />
        <EmptyState eyebrow="Hata" tone="danger" title="Bir şeyler ters gitti." description="Tekrar dener misin?" actionLabel="Tekrar dene" onAction={() => {}} />
      </Section>

      <Section title="Toast">
        <View style={styles.wrap}>
          <PillButton title="Nötr" variant="outline" size="sm" onPress={() => toast('Fotoğraf yükleniyor.')} />
          <PillButton title="Onay" variant="outline" size="sm" onPress={() => toast('Takas isteğin gönderildi.', 'success')} />
          <PillButton title="Hata" variant="outline" size="sm" onPress={() => toast('İstek gönderilemedi.', 'danger')} />
        </View>
      </Section>

      <Section title="Oyun kartı">
        <View style={styles.card}>
          <GameCard
            title="Örnek Oyun: Uzun Bir Macera"
            platform="PS5"
            condition="Çok iyi"
            cover={null}
            username="ornek_1"
            rating={{ avg: 4.8, count: 12 }}
            distanceLabel="3 km'den yakın"
            photoCount={3}
            onPressPhotos={() => toast('Galeri 3. adımda gelecek.')}
          />
        </View>
      </Section>

      <Section title="Kart destesi">
        <View style={styles.deck}>
          <SwipeDeck
            key={deckKey}
            items={SAMPLE_GAMES}
            keyExtractor={(game) => game.id}
            labelExtractor={(game) => `${game.title}, ${game.platform}, @${game.username}`}
            cardActions={() => [
              { name: 'photos', label: 'Fotoğrafları gör', onPress: () => toast('Galeri 3. adımda gelecek.') },
            ]}
            onSwipe={(game, direction) =>
              toast(direction === 'right' ? `${game.title}: takas` : `${game.title}: geçildi`, direction === 'right' ? 'success' : 'neutral')
            }
            renderCard={(game, { isTop }) => (
              <GameCard
                title={game.title}
                platform={game.platform}
                condition={game.condition}
                cover={null}
                username={game.username}
                rating={null}
                distanceLabel="10 km'den yakın"
                photoCount={2}
                live={isTop}
              />
            )}
            empty={
              <EmptyState
                title="Şimdilik bu kadar."
                description="Biraz sonra yeni ilanlar gelir."
                actionLabel="Baştan al"
                onAction={() => setDeckKey((k) => k + 1)}
              />
            }
          />
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  facts: {
    gap: space.xxs,
  },
  section: {
    gap: space.sm,
    marginTop: space.lg,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  swatch: {
    alignItems: 'center',
    gap: space.xxs,
    width: layout.touchMin + space.lg,
  },
  swatchColor: {
    width: layout.touchMin,
    height: layout.touchMin,
    borderRadius: radius.row,
    borderWidth: layout.borderWidth,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  glassStage: {
    height: space.xxl * 4,
    borderRadius: radius.card,
    borderWidth: layout.borderWidth,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  stripe: {
    flex: 1,
  },
  glassRow: {
    flexDirection: 'row',
    gap: space.xs,
    padding: space.md,
  },
  glassTile: {
    flex: 1,
    height: space.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    aspectRatio: layout.cardAspect,
  },
  deck: {
    aspectRatio: layout.cardAspect * (2 / 3),
  },
});
