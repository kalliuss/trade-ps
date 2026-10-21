# Tasarım dili

Kaynak: kaanbilgili.com UI kit'i (`github.com/kalliuss/portfolio` → `style.css`). Tüm değerler `src/constants/theme.ts` içinde; bu dosya kuralları anlatır.

## 1. İlkeler
- **Sakin ve minimal.** Apple çizgisi; az renk, bol boşluk, tek vurgu rengi (haki).
- **Cam.** Gezinme, başlık, kart paneli ve alt sayfalar yarı saydam cam; geri kalan her şey düz zemin.
- **Hap formu.** Düğme, chip, sekme çubuğu yarıçap 999. Kartlar 14, oyun kartı 28.
- **İnce kenarlık, gölge yok.** Yüzeyleri 1px `line`/`line2` ayırır.
- **Her ekran aynı parçalardan.** Ortak bileşenler `src/components/ui/`; ekran kendi düğmesini/kartını yazmaz.
- **Türkçe, samimi, sade metin** (bkz. §10).

**Yapma:** neon, parıltı, gradyan zemin, gece kulübü havası · ekranda sabit hex/rgba/piksel · token dışı yeni renk · aynı işi gören ikinci bir bileşen.

## 2. Renkler
| Token | Dark | Light | Kullanım |
|---|---|---|---|
| bg | `#060606` | `#f2f2ec` | Sayfa zemini |
| bgRaised | `#111110` | `#e7e7df` | Yükseltilmiş yüzey, cam geri dönüşü |
| ink | `#f1f1ec` | `#121210` | Ana metin, dolu düğme zemini |
| ink2 | `#a3a39b` | `#52524c` | İkincil metin, etiketler |
| ink3 | `#66665f` | `#8a8a82` | **Sadece** süs, pasif öğe, 18+ boyutlu metin |
| line / line2 | `rgba(241,241,236,.08/.16)` | `rgba(18,18,16,.09/.18)` | Ayırıcı / kenarlık |
| inkSoft | `ink` %10 | `ink` %10 | Aktif sekme zemini |
| accent | `#a9b27c` | `#5d6b35` | Haki vurgu |
| accentInk | `#c4cb9f` | `#4c5829` | Vurgu rengiyle metin |
| accentSoft | `rgba(169,178,124,.14)` | `rgba(93,107,53,.12)` | Vurgu zemini, basılı halka |
| onInk | `bg` | `bg` | Dolu düğme yazısı |

**Anlamsal:** `success*` = `accent*` (onay = haki). `danger` kırmızı ton:
| Token | Dark | Light |
|---|---|---|
| danger | `#e5736a` | `#b3382f` |
| dangerInk | `#f0a29b` | `#9a2e26` |
| dangerSoft | `rgba(229,115,106,.14)` | `rgba(179,56,47,.10)` |
| successBorder / dangerBorder | ana renk %45 | ana renk %45 |

**Ölçülen kontrast (WCAG):** danger bg'de 6.75 (dark) / 5.30 (light), bgRaised'de 6.29 / 4.79; dangerInk dangerSoft'ta 8.63 / 5.79; accentInk accentSoft'ta 9.91 / 5.85; ink2 7.98 / 7.00. Hepsi ≥ 4.5, başlangıç değerleri korundu.
**ink3 4.5'i tutmaz** (3.50 / 3.09): okunması gereken metinde kullanılmaz, yerine `ink2`.

**Durum chip'leri:** bekliyor → nötr (`ink2` yazı, `line2` kenar) · kabul / tamamlandı → haki · red / iptal → kırmızı.

## 3. Tipografi
Geist (metin) + Geist Mono (etiket, sayı, durum). Paket: `@expo-google-fonts/geist` ve `geist-mono` (lisans OFL); `ui/fonts.ts` sadece kullanılan 6 ağırlığı yükler. Android'de `fontWeight` özel fontta ağırlık seçmez, her ağırlık ayrı `fontFamily`. RN'de harf aralığı em değil nokta: token'larda hesaplanmış hali var.
**Büyük harf:** RN `textTransform` Türkçe "i"yi "I" yapar. `Text` bileşeni büyük harfi `toLocaleUpperCase('tr-TR')` ile çevirir (i → İ). Kullanıcı adı gibi özel adlar büyük harfli varyantla yazılmaz.

| Token | Boyut / satır | Font | Harf aralığı | Kullanım |
|---|---|---|---|---|
| display | 34 / 38 | Geist 300 (vurgulu kelime 600) | -0.035em | Ekran başlığı, boş durum |
| title | 24 / 28 | Geist 500 | -0.02em | Bölüm başlığı |
| headline | 19 / 24 | Geist 500 | -0.02em | Kart başlığı, oyun adı |
| body | 16 / 24 | Geist 400 | 0 | Metin |
| bodySm | 14 / 20 | Geist 400 | 0 | İkincil metin |
| label | 14 / 20 | Geist 500 | 0 | Düğme yazısı |
| caption | 12 / 16 | Mono 400, BÜYÜK | 0.06em | Etiket, sayı |
| micro | 11 / 14 | Mono 400, BÜYÜK | 0.06em | Chip |
| eyebrow | 12 / 16 | Mono 500, BÜYÜK | 0.16em | Üst başlık (`accentInk`) |
| tab | 11 / 14 | Geist 500 | 0 | Sekme etiketi (mono değil: "Envanterim" sığsın) |
| stamp | 20 / 24 | Mono 500, BÜYÜK | 0.16em | Kart damgası (TAKAS / GEÇ) |

Sistem yazı büyütmesine uyulur; başlıklarda `maxFontSizeMultiplier` 1.3, gövdede 1.6.

## 4. Boşluk, yarıçap, boyut
- **Izgara (4'lük):** 4, 8, 12, 16, 24, 32, 48. Tek istisna chip dolgusu (2×8, sitedeki 2×9).
- **Yerleşim:** ekran kenarı 20 · kart iç boşluğu 16 · liste aralığı 12 · bölüm arası 32.
- **Yarıçap:** 10 satır vurgusu · 14 kart, konteyner, metin alanı · 20 alt sayfa üst köşe · 28 oyun kartı · 999 hap.
- **Dokunma alanı en az 48dp.** Sitedeki düğme 42; mobilde **düğme 48**. Görseli küçük öğelerde (chip, ikon) `hitSlop` ile 48'e tamamla.
- İkon 24, çizgi kalınlığı 1.5. Kenarlık her yerde 1.

## 5. Cam sistemi (liquid glass)
| Seviye | Nerede | Blur (expo-blur intensity) | Renk dark / light |
|---|---|---|---|
| glass-1 | Chip, düz zemin üstü küçük yüzey | 30 | `rgba(20,20,19,.55)` / `rgba(242,242,236,.60)` (site değeri) |
| glass-2 | Alt çubuk, üst başlık, **fotoğraf üstü panel** | 45 | `.68` / `.70` |
| glass-3 | Alt sayfa, modal | 65 | `.85` / `.86` |

Her cam: renk + blur + `line2` 1px kenarlık + üstte 1px `glassHighlight` (yansıma). Köşe için `overflow: 'hidden'` (BlurView `borderRadius` uygulamaz).
- **Neden üç ton:** Koyu temada site değeri (.55) en kötü durumda (beyaz kapak görseli) ink için 3.60 verir. Fotoğraf üstünde en az glass-2 (.68 → 5.6). Fotoğraf üstünde sadece `ink` yazılır; `ink2` orada 4.5'i tutmaz.
- **iOS 26+:** `expo-glass-effect` `GlassView` (`glassEffectStyle="regular"`, `tintColor` = seviye rengi, `colorScheme` = uygulama teması). `opacity` ile soldurma yok (cam kaybolur), `glassEffectStyle` animasyonu kullan.
- **iOS < 26 ve Android 12+ (API 31):** `expo-blur` `BlurView`. Android'de `blurMethod="dimezisBlurViewSdk31Plus"` ve arkadaki içerik hedef olarak işaretlenir: `<BlurTargetProvider>` içinde arka plan `<BlurTarget>`, cam onun **dışında** (kendi hedefinin içinde olamaz). Hedef yoksa cam düz zemine düşer.
- **Geri dönüş (düz `bgRaised` + `line2`):** Android < 12, iOS "Saydamlığı azalt" açık (`AccessibilityInfo.isReduceTransparencyEnabled`), `isGlassEffectAPIAvailable()` false ve BlurView yoksa.
- **Performans:** Ekranda üst üste en fazla 2 blur. Liste satırlarında blur yok. Cam yalnızca: alt çubuk, üst başlık, kart alt paneli, alt sayfa/modal.

## 6. Alt gezinme çubuğu (GlassTabBar)
- Altta yüzen hap, kenarlardan 16, alttan `16 + safeArea.bottom`. Yükseklik 64, glass-2, 4 iç boşluk.
- Sekme: ikon 24 (stroke 1.5) + `tab` etiketi. Aktif: `ink` yazı + `inkSoft` zeminli iç hap. Pasif: `ink2`.
- Sekmeler (onaya tabi): **Keşfet · İstekler · Mesajlar · Envanterim · Profil.** Rozet (yeni istek/mesaj) haki nokta.
- İçerik çubuğun arkasından kayar; kaydırılan ekranların altına `tabBarSpace + safeArea.bottom` boşluk.
- **Karar: özel JS çubuk** (`expo-router/ui`: `Tabs` + `TabSlot` + `TabList` + `TabTrigger`). Native sekmeler iOS 26'da sistem camını, Android'de Material çubuğu verir: iki platform farklı görünür, token'larla stil verilemez. Özel çubukta iOS 26'da yine `GlassView` kullanılır.
- `TabTrigger`'lar `(app)/_layout.tsx` içinde satır içi yazılır (Expo Router onları JSX'ten okur); görünüm `GlassTabBar` / `GlassTabButton`'da.

## 7. Kart akışı (Keşfet)
- **GameCard:** yarıçap 28, `line2` kenarlık. Kapak görseli tam yüzey (`expo-image`). Altta glass-2 tonlu panel: oyun adı (headline), chip'ler (PS5/PS4, durum), kullanıcı adı, puan (mono), mesafe kaba aralıkla ("3 km'den yakın"; koordinat asla).
- **Disk fotoğrafı:** sağ üstte "Gerçek fotoğraf" rozeti + fotoğraf sayısı; dokununca çevrilebilir galeri. Güven unsuru, gizlenmez.
- **Kaydırma:** kart parmağı izler; eşik ekran genişliğinin %30'u veya hız 800. Dönme en fazla 8°. Sağa: haki **TAKAS** damgası, sola: kırmızı **GEÇ** damgası; opaklık eşiğe göre 0→1. Bırakınca yay animasyonu (geri döner ya da uçar).
- **Düğmeler (zorunlu):** kartın altında 2 yuvarlak düğme, ✕ (danger kenarlık) ve ✓ (haki dolu), 56 çap, erişilebilirlik etiketli: "Geç", "Takas teklif et".
- **Boş durum:** "Şimdilik bu kadar. Biraz sonra yeni ilanlar gelir."

## 8. Hareket
- Easing `cubic-bezier(0.22, 1, 0.36, 1)` (Reanimated: `Easing.bezier(...motion.easing)`).
- Süreler: basma 180 ms · geçiş 350 ms · giriş 600-900 ms, öğeler arası 70 ms, 18 aşağıdan yukarı + opaklık.
- Basınca `scale(0.98)` + `accentSoft` halka. Nefes: opaklık 0.55↔1, 3.2 sn (sadece "şu an"/çevrimiçi noktası).
- **Hareketi azalt** (`AccessibilityInfo.isReduceMotionEnabled` / Reanimated `useReducedMotion`): giriş animasyonu ve nefes yok, geçişler sadece soldurma, kart parmağı izler ama dönme ve uçuş yok.

## 9. Tema
- Varsayılan **Sistem**; Profil → Ayarlar'dan Sistem / Açık / Koyu. Tercih AsyncStorage'da saklanır.
- `ThemeProvider` çözülmüş temayı verir; `StatusBar`, `GlassView colorScheme` ve native bileşenler (`Appearance.setColorScheme`) buna uyar.
- Her ekran ve bileşen iki temada denenir.

## 10. Metin tonu
- "Sen" dili, kısa cümle, ünlem az, teknik terim yok. Şikayet, engel, hesap silmede daha sakin ve net.
- Hata: "Bir şeyler ters gitti. Tekrar dener misin?" · Boş: "Henüz oyun eklemedin. İlk oyununu ekleyerek başla." · Onay: "Takas isteğin gönderildi."
- Sabit terimler: **Keşfet, Takas isteği, Envanterim, Mesajlar, Profil.** Eş anlamlı kullanma ("ilan" ≠ "gönderi").
- Renk anlamı sabit: kırmızı = hata/geri alınamaz, haki = onay/başarı. Başka anlamda kullanılmaz.

## 11. Bileşenler (`src/components/ui/`, hepsi `@/components/ui`'dan)
| Bileşen | Görevi |
|---|---|
| `ThemeProvider` / `useTheme` | Çözülmüş tema, renkler, tema tercihi, hareketi/saydamlığı azalt |
| `Screen` | Her ekranın kabuğu: zemin, güvenli alan, klavye, kenar boşluğu, başlık, geri |
| `Text` | Tüm metinler; `variant` (tipografi) + `tone` (renk) |
| `Icon` | 1.5 çizgili SVG ikon seti |
| `GlassView` + `BlurTargetProvider` / `BlurTarget` | Platforma göre cam (liquid / blur / düz), seviye 1-3 |
| `PillButton` | Hap düğme: `solid`, `outline`, `danger`; `md`/`sm`; yükleniyor |
| `Chip` / `StatusBadge` | Mono etiket: nötr / haki / kırmızı · takas durumu → doğru chip |
| `SegmentedControl` | Hap içinde hap seçici (tema seçimi) |
| `GlassTabBar` / `GlassTabButton` | Yüzen alt gezinme çubuğu |
| `GameCard` / `SwipeDeck` | Oyun kartı · kart destesi, kaydırma + ✕/✓ düğmeleri |
| `TextField` | Etiketli metin alanı, ipucu, hata `dangerInk` |
| `EmptyState` | Boş, hata, "yakında" durumları |
| `ToastProvider` / `useToast` | Alttan hap bildirim (`ink` zemin), çubuğun üstünde |

Tüm bileşenler geliştirmede **Profil → Tasarım önizleme** (`/tasarim`) ekranında iki temada görülür.
