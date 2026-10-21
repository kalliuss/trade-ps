# Yol haritası

Her adım şu sırayla yapılır: db-architect (gerekirse) → supabase-integration → mobile-ui-builder → code-reviewer → security-reviewer.
🔍 işaretli adımlardan sonra **cyber-security-expert** ve **qa-expert** de çalıştırılır.
Her adımın sonunda iki test hesabıyla (A ve B) telefonda elle deneme yapılır.

Durum: ⬜ başlamadı · 🟨 devam ediyor · ✅ bitti

---

### 0. Kurulum ✅
Klasör düzeni, CLAUDE.md, Supabase istemcisi, tipler, subagent'lar, dokümanlar.

### 0.5. Tasarım temeli 🟨 (kod yazıldı, telefonda görsel onay bekliyor)
`docs/DESIGN.md`, `src/constants/theme.ts`, Geist fontları, `ThemeProvider` + tema tercihi (Sistem/Açık/Koyu, AsyncStorage), `src/components/ui/` bileşenleri, `GlassTabBar` ve sekmeler (Keşfet, İstekler, Mesajlar, Envanterim, Profil), dev-only tasarım önizleme ekranı (`/tasarim`). Mevcut ekranlar (giriş, kayıt, onboarding, profil) yeni bileşenlere geçirildi, eski tema API'si kaldırıldı.
**Bitti sayılır:** Bileşenler her iki temada ve her iki platformda (iOS/Android) görsel olarak onaylandı; Android'de blur ve geri dönüşü, "hareketi azalt" çalışıyor.
**Ertelenen küçük cilalar (code-reviewer, Düşük):** ✕/✓ düğmelerinde basınca `accentSoft` halkası (şu an sadece küçülme) · deste dikey kaydırmalı ekranda kullanılırsa Pan'a `failOffsetY` · Toast sekme çubuğu olmayan ekranlarda gereğinden yüksekte duruyor · `BlurTargetProvider` var ama `BlurTarget` yoksa `GlassView` düz zemine düşmüyor (şu an böyle bir ekran yok) · `Chip onImage` sadece nötr tonda, haki/kırmızı chip fotoğraf üstünde kontrast garantisiz.

### 1. Auth ve profil 🟨 (kod yazıldı, telefonda test bekliyor)
E-posta + parola ile kayıt/giriş/çıkış, oturumun hatırlanması, profil görüntüleme ve düzenleme (kullanıcı adı, görünen ad, bio, avatar yükleme). Şablon demo ekranları ve bileşenleri temizlenir.
**Bitti sayılır:** A hesabı kaydolur, uygulamayı kapatıp açınca hâlâ girişlidir; profilini düzenler ve avatar yükler; kullanıcı adı kuralı (3-20, harf/rakam/_) ve "kullanıcı adı alınmış" hatası Türkçe gösterilir; çıkış yapınca giriş ekranına döner.

### 2. Oyun ekleme: RAWG araması + disk fotoğrafı ⬜
`search-games` ile arama, platform (PS4/PS5) ve durum seçimi, kameradan/galeriden disk fotoğrafı (1-5 adet) yükleme, `create_listing`. Envanter listesi, ilanı düzenleme ve `remove_listing`.
**Bitti sayılır:** A bir oyunu arar, fotoğrafla ekler, envanterde görür, açıklamasını düzenler ve kaldırır; giriş yapmadan arama çalışmaz; 5 MB üstü veya yanlış formatta fotoğraf anlaşılır hatayla reddedilir.

### 3. Kart akışı ve sola kaydırma ⬜ 🔍
`get_feed` ile kart destesi (Gesture Handler + Reanimated), sola kaydırma = `record_swipe_left`, deste bitince yeniden yükleme, boş akış ekranı.
**Bitti sayılır:** B, A'nın ilanını görür; sola kaydırınca ilan bir daha gelmez (uygulama yeniden açılsa bile); kendi ilanları akışta görünmez; kaydırmaya alternatif butonlar var.
**0.5'ten devreden (unutma):**
- `SwipeDeck.onSwipe` kart uçtuktan sonra çağrılıyor; `record_swipe_left` / istek RPC'si hata verirse kartı desteye geri getirme yolu Keşfet ekranında kurulacak.
- Mesafeyi kaba aralığa çeviren tek yardımcı (`'<1' | '1-3' | '3-10' | '10+'` km) `features/swipe` içinde; `GameCard`'a sadece onun çıktısı gider (9. adımda da kullanılır).
- `GameCard` disk fotoğrafı rozeti (`onPressPhotos`) için çevrilebilir galeri ve `SwipeDeck cardActions` ile ekran okuyucu eylemi "Fotoğrafları gör".

### 4. Takas isteği gönderme ⬜
Sağa kaydır → kendi envanterinden açık bir oyun seç → `send_swap_request`. Envanteri boşsa açıklama + "oyun ekle" yönlendirmesi.
**Bitti sayılır:** B isteği gönderir; aynı ilana ikinci istek ve çift dokunma tek istek üretir; envanteri boş kullanıcı istek gönderemez; günlük limit hatası Türkçe gösterilir.

### 5. Gelen istekler ve uygulama içi bildirim ⬜
Gelen/giden istek listeleri, gelen isteği sağa (kabul) / sola (red) kaydırma, Realtime ile uygulama açıkken anlık bildirim (rozet/banner). Gönderenin isteği geri çekmesi (`cancel_swap`).
**Bitti sayılır:** B istek gönderince A'nın listesi yenilemeden güncellenir; A reddedince B "reddedildi" görür; B bekleyen isteği geri çekebilir.

### 6. Kabul ve sohbet (Realtime) ⬜ 🔍
`respond_swap_request` ile kabul → sohbet açılır. Mesaj listesi, gönderme, Realtime ile anlık mesaj, klavye yönetimi, sayfalama.
**Bitti sayılır:** A kabul edince ikisinde de sohbet açılır; mesajlar anlık gelir; aynı ilana bekleyen diğer istekler iptal olur ve ilanlar akıştan düşer; sohbet dışı biri mesajları okuyamaz.

### 7. Takas onayı ve karşılıklı puanlama ⬜
"Takas gerçekleşti" (`confirm_swap`), tek taraflı onay bekleme durumu, kabul sonrası iptal (`cancel_swap`), tamamlanınca puanlama (`submit_rating`), profilde puan.
**Bitti sayılır:** İki taraf onaylayınca takas "tamamlandı" olur ve puanlama açılır; tek onayda "karşı taraf bekleniyor" görünür; ikinci kez puan verilemez; iptal edilince ilanlar tekrar açılır.

### 8. Engelleme ve şikayet ⬜
Profil, ilan ve sohbetten engelle / şikayet et; engellenenler listesi ve engeli kaldırma.
**Bitti sayılır:** A, B'yi engelleyince birbirlerinin ilanlarını ve profilini görmezler, istek ve mesaj gönderemezler; şikayet nedenleriyle gönderilir; engel kaldırılabilir.

### 9. Konum filtresi ⬜ 🔍
İzin isteme (`expo-location`), yaklaşık konum gönderme (`set_my_location`), aç/kapat ve mesafe ayarı, kartta mesafe gösterimi. Üçgenleme riskine karşı mesafenin kaba aralıklarla gösterilmesi ve güncelleme sıklığı sınırı (migration 0002 önerisi, bkz. SECURITY.md).
**Bitti sayılır:** Konum açıkken sadece yakın ilanlar gelir, kapatınca hepsi; izin reddedilirse uygulama çalışmaya devam eder; hiçbir yanıtta koordinat yoktur.

### 10. Push bildirimleri ⬜
`expo-notifications` + Expo push servisi, cihaz token'ının saklanması (yeni tablo, RLS), istek/kabul/mesajda Edge Function veya Database Webhook ile push.
**Neden development build gerekebilir:** Expo Go, SDK 53'ten beri Android'de **uzak (remote) push bildirimlerini desteklemiyor**. Push'u gerçek cihazda denemek için `eas build --profile development` ile kendi geliştirme sürümümüzü üretmemiz gerekecek. Bu adıma gelince güncel SDK dokümanından tekrar doğrulanacak.
**Bitti sayılır:** Uygulama kapalıyken B istek gönderince A'nın telefonuna bildirim gelir; bildirime dokununca ilgili ekran açılır; kullanıcı bildirimleri kapatabilir.

### 11. Hesap silme, RAWG atfı, mağaza hazırlığı ⬜ 🔍
- **Hesap silme:** `delete-account` Edge Function'ı. Kullanıcının JWT'sini doğrular, kendi Storage dosyalarını siler, `auth.admin.deleteUser` çağırır (cascade ile tüm veriler gider). service_role anahtarı **sadece fonksiyonun içinde** Supabase secret'ı olarak bulunur, istemcide asla bulunmaz.
- **Hakkında ekranı:** "Oyun verileri RAWG'dan" + https://rawg.io linki, sürüm, gizlilik politikası linki.
- Mağaza: gizlilik politikası, veri güvenliği formu, ikon/splash, `app.json` (paket adı, izin metinleri), EAS build ve submit.
- 0.5'ten devreden: `app.json` `android.adaptiveIcon.backgroundColor` hâlâ şablon mavisi, splash görseli şablon Expo logosu (renkler `bg` token'ına çekildi); kullanılmayan şablon görselleri (`assets/images/tabIcons` vb.) temizlenecek.
**Bitti sayılır:** Hesap silinince kullanıcı ve verileri kaybolur, aynı e-postayla yeniden kayıt olunabilir; SECURITY.md'deki yayın öncesi kontrol listesi tamamen işaretlidir.
