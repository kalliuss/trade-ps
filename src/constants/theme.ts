/**
 * PS Takas tasarım token'ları.
 *
 * Tek kaynak: ekranlarda sabit renk/boyut yazılmaz. Renk, yazı, boşluk, yarıçap,
 * cam ve hareket değerleri sadece buradan okunur. Kurallar: docs/DESIGN.md
 * Palet kaynağı: kaanbilgili.com UI kit'i (github.com/kalliuss/portfolio, style.css).
 */

export type ColorScheme = 'light' | 'dark';
export type ThemePreference = 'system' | ColorScheme;

export type Palette = {
  bg: string;
  bgRaised: string;
  ink: string;
  ink2: string;
  /** 4.5:1'i tutmaz: sadece süs, pasif öğe veya 18+ boyutlu metin. */
  ink3: string;
  line: string;
  line2: string;
  /** Aktif sekme zemini (ink %10). */
  inkSoft: string;
  /** Dolu (ink zeminli) düğme üstündeki yazı. */
  onInk: string;
  /** Dolu haki (accent zeminli) düğme üstündeki ikon/yazı. */
  onAccent: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  accentBorder: string;
  success: string;
  successInk: string;
  successSoft: string;
  successBorder: string;
  danger: string;
  dangerInk: string;
  dangerSoft: string;
  dangerBorder: string;
  glass1: string;
  glass2: string;
  glass3: string;
  /** Cam yüzeylerin üst kenarındaki ince yansıma çizgisi. */
  glassHighlight: string;
  /** Modal / alt sayfa arkasındaki karartma. */
  scrim: string;
};

const darkAccent = {
  accent: '#a9b27c',
  accentInk: '#c4cb9f',
  accentSoft: 'rgba(169, 178, 124, 0.14)',
  accentBorder: 'rgba(169, 178, 124, 0.45)',
};

const lightAccent = {
  accent: '#5d6b35',
  accentInk: '#4c5829',
  accentSoft: 'rgba(93, 107, 53, 0.12)',
  accentBorder: 'rgba(93, 107, 53, 0.45)',
};

export const palette = {
  dark: {
    bg: '#060606',
    bgRaised: '#111110',
    ink: '#f1f1ec',
    ink2: '#a3a39b',
    ink3: '#66665f',
    line: 'rgba(241, 241, 236, 0.08)',
    line2: 'rgba(241, 241, 236, 0.16)',
    inkSoft: 'rgba(241, 241, 236, 0.10)',
    onInk: '#060606',
    onAccent: '#060606',
    ...darkAccent,
    // Onay = haki: sitenin vurgu rengiyle aynı.
    success: darkAccent.accent,
    successInk: darkAccent.accentInk,
    successSoft: darkAccent.accentSoft,
    successBorder: darkAccent.accentBorder,
    // Kontrast: bg 6.75, bgRaised 6.29; dangerInk dangerSoft üstünde 8.63.
    danger: '#e5736a',
    dangerInk: '#f0a29b',
    dangerSoft: 'rgba(229, 115, 106, 0.14)',
    dangerBorder: 'rgba(229, 115, 106, 0.45)',
    // glass1 site değeri; fotoğraf üstünde en az glass2 (beyaz zeminde ink 5.62).
    glass1: 'rgba(20, 20, 19, 0.55)',
    glass2: 'rgba(20, 20, 19, 0.68)',
    glass3: 'rgba(20, 20, 19, 0.85)',
    glassHighlight: 'rgba(255, 255, 255, 0.06)',
    scrim: 'rgba(0, 0, 0, 0.6)',
  },
  light: {
    bg: '#f2f2ec',
    bgRaised: '#e7e7df',
    ink: '#121210',
    ink2: '#52524c',
    ink3: '#8a8a82',
    line: 'rgba(18, 18, 16, 0.09)',
    line2: 'rgba(18, 18, 16, 0.18)',
    inkSoft: 'rgba(18, 18, 16, 0.10)',
    onInk: '#f2f2ec',
    onAccent: '#f2f2ec',
    ...lightAccent,
    success: lightAccent.accent,
    successInk: lightAccent.accentInk,
    successSoft: lightAccent.accentSoft,
    successBorder: lightAccent.accentBorder,
    // Kontrast: bg 5.30, bgRaised 4.79; dangerInk dangerSoft üstünde 5.79.
    danger: '#b3382f',
    dangerInk: '#9a2e26',
    dangerSoft: 'rgba(179, 56, 47, 0.10)',
    dangerBorder: 'rgba(179, 56, 47, 0.45)',
    glass1: 'rgba(242, 242, 236, 0.6)',
    glass2: 'rgba(242, 242, 236, 0.7)',
    glass3: 'rgba(242, 242, 236, 0.86)',
    glassHighlight: 'rgba(255, 255, 255, 0.5)',
    scrim: 'rgba(18, 18, 16, 0.35)',
  },
} satisfies Record<ColorScheme, Palette>;

/** Takas durumu → chip tonu (bkz. DESIGN.md §2). */
export const statusTone = {
  pending: 'neutral',
  accepted: 'success',
  completed: 'success',
  declined: 'danger',
  cancelled: 'danger',
} as const;

export type SwapStatus = keyof typeof statusTone;

// ---------- Tipografi ----------

/**
 * @expo-google-fonts/geist ve geist-mono yükleme adları. Android'de fontWeight
 * özel fontta ağırlık seçmediği için her ağırlık ayrı aile olarak kullanılır.
 */
export const fontFamily = {
  light: 'Geist_300Light',
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semiBold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
} as const;

export type TextToken = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'uppercase';
};

/** CSS em değerini RN'nin nokta cinsinden letterSpacing değerine çevirir. */
const em = (fontSize: number, value: number) => Math.round(fontSize * value * 100) / 100;

export const typography = {
  display: { fontFamily: fontFamily.light, fontSize: 34, lineHeight: 38, letterSpacing: em(34, -0.035) },
  /** display içindeki vurgulu kelime. */
  displayStrong: { fontFamily: fontFamily.semiBold, fontSize: 34, lineHeight: 38, letterSpacing: em(34, -0.035) },
  title: { fontFamily: fontFamily.medium, fontSize: 24, lineHeight: 28, letterSpacing: em(24, -0.02) },
  headline: { fontFamily: fontFamily.medium, fontSize: 19, lineHeight: 24, letterSpacing: em(19, -0.02) },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodySm: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  label: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontFamily: fontFamily.mono, fontSize: 12, lineHeight: 16, letterSpacing: em(12, 0.06), textTransform: 'uppercase' },
  micro: { fontFamily: fontFamily.mono, fontSize: 11, lineHeight: 14, letterSpacing: em(11, 0.06), textTransform: 'uppercase' },
  eyebrow: { fontFamily: fontFamily.monoMedium, fontSize: 12, lineHeight: 16, letterSpacing: em(12, 0.16), textTransform: 'uppercase' },
  tab: { fontFamily: fontFamily.medium, fontSize: 11, lineHeight: 14, letterSpacing: 0 },
  /** Kart üstündeki TAKAS / GEÇ damgası. */
  stamp: { fontFamily: fontFamily.monoMedium, fontSize: 20, lineHeight: 24, letterSpacing: em(20, 0.16), textTransform: 'uppercase' },
} satisfies Record<string, TextToken>;

export type TextVariant = keyof typeof typography;

/** Sistem yazı büyütmesi üst sınırı. */
export const fontScale = { heading: 1.3, body: 1.6 } as const;

// ---------- Boşluk, yarıçap, boyut ----------

/** 4'lük ızgara. Bunun dışında boşluk kullanılmaz. */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  row: 10,
  card: 14,
  sheet: 20,
  deck: 28,
  pill: 999,
} as const;

export const layout = {
  screenX: 20,
  cardPadding: space.md,
  listGap: space.sm,
  sectionGap: space.xl,
  borderWidth: 1,
  stampBorder: 2,
  avatar: 96,
  /** Disk fotoğrafı rozeti, ikon gibi küçük öğeler. */
  iconSizeSm: 14,
  /** Dolu düğmedeki ikon dairesi. */
  buttonIconCircle: 32,
  /** Chip: sitedeki 2×9 dolgunun 4'lük ızgaraya yakın hali (tek istisna). */
  chipPaddingY: 2,
  chipPaddingX: 8,
  chipGap: 6,
  /** Durum noktası çapı. */
  dot: 6,
  /** Kapak görseli olmayan oyun kartındaki disk ikonu. */
  placeholderIcon: 64,
  /** Pasif (disabled) öğe opaklığı. */
  disabledOpacity: 0.5,
  /** Oyun kartı en/boy oranı (deste dışında tek başına gösterilirken). */
  cardAspect: 3 / 4,
  /** En küçük dokunma alanı (dp). */
  touchMin: 48,
  buttonHeight: 48,
  swipeButton: 56,
  iconSize: 24,
  iconStroke: 1.5,
  tabBarHeight: 64,
  tabBarMargin: space.md,
  tabBarPadding: space.xxs,
  /** Çubuğun arkasında kayan içerik için alt boşluk (+ safeArea.bottom). */
  tabBarSpace: 64 + space.md + space.md,
  maxContentWidth: 800,
} as const;

// ---------- Cam ----------

export type GlassLevel = 1 | 2 | 3;

export const glass = {
  /** expo-blur BlurView intensity (1-100). Önizleme ekranında ince ayar yapılacak. */
  blurIntensity: { 1: 30, 2: 45, 3: 65 },
  /** Android: API 31 altında blur yok, düz bgRaised kullanılır. */
  androidBlurMethod: 'dimezisBlurViewSdk31Plus',
  androidMinApi: 31,
  /** Ekranda üst üste en fazla blur katmanı. */
  maxStackedLayers: 2,
} as const satisfies {
  blurIntensity: Record<GlassLevel, number>;
  androidBlurMethod: string;
  androidMinApi: number;
  maxStackedLayers: number;
};

// ---------- Hareket ----------

export const motion = {
  /** cubic-bezier(0.22, 1, 0.36, 1) → Easing.bezier(...motion.easing) */
  easing: [0.22, 1, 0.36, 1] as const,
  duration: {
    press: 180,
    transition: 350,
    enter: 600,
    enterSlow: 900,
    breathe: 3200,
    /** Kartın ekrandan uçup gitmesi. */
    swipeOut: 260,
    /** Toast'ın ekranda kalma süresi. */
    toast: 2600,
  },
  stagger: 70,
  enterOffset: 18,
  pressScale: 0.98,
  breatheOpacity: { min: 0.55, max: 1 },
  spring: { damping: 20, stiffness: 200, mass: 1 },
  swipe: {
    /** Ekran genişliğine oranla karar eşiği. */
    thresholdRatio: 0.3,
    velocity: 800,
    maxRotateDeg: 8,
    /** Arkadaki kartın ölçeği. */
    behindScale: 0.96,
    /** Uçan kartın gideceği mesafe (ekran genişliği katı). */
    flyOutRatio: 1.5,
    stampRotateDeg: 12,
  },
} as const;
