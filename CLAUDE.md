# PS Takas — Claude Code rehberi

`AGENTS.md` içindeki Expo kuralları da geçerlidir (SDK dokümanını kontrol et, `npx expo install` kullan).

## 1. Proje özeti
PlayStation oyunlarının **sadece takasla, yüz yüze** el değiştirdiği mobil uygulama. Para yok, kargo yok, yönetici rolü yok.
Akış: kayıt + profil → envantere oyun ekle (RAWG araması + kendi disk fotoğrafı) → kart akışı (sağa = envanterden oyun seçip takas isteği, sola = istemiyorum) → karşı taraf isteği sağa/sola kaydırarak kabul/red eder → kabulde sohbet açılır → iki taraf "takas gerçekleşti" onayı verir → karşılıklı puanlama. İsteğe bağlı konum filtresi. Şikayet, engelleme ve puana dayalı görünürlük baştan vardır.
İstek göndermek için envanterde takasa açık en az bir oyun gerekir.

## 2. Teknoloji ve komutlar
- Expo **SDK 57** (bilerek sabit, kullanıcı istemeden yükseltme), React Native 0.86, TypeScript strict, Expo Router. Test: Android telefonda Expo Go.
- Backend: Supabase (Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions). Proje: `hraryfwduchjzfavsnnj`.
- Paket yöneticisi: npm (`package-lock.json`).

```bash
npx expo start          # geliştirme sunucusu
npx tsc --noEmit        # tip kontrolü
npx expo lint           # lint (ESLint, eslint.config.js)
npx expo-doctor         # bağımlılık/config teşhisi
npx expo install <pkg>  # paket ekleme (npm install değil)
```
Bir iş "bitti" denmeden önce `tsc` ve `lint` temiz olmalı.

## 3. Klasör düzeni
```
src/app/                 Expo Router ekranları ve _layout.tsx (SADECE ekran/yönlendirme)
src/features/<özellik>/  auth, profile, listings, swipe, swaps, chat, ratings, safety
  api.ts                 Supabase çağrıları (RPC, sorgu, Realtime, Edge Function)
  hooks.ts               api.ts'i saran React hook'ları (yükleniyor/hata durumu)
  types.ts               özelliğe ait tipler
  components/            özelliğe ait bileşenler
src/components/          ortak UI bileşenleri
src/components/ui/       tasarım sistemi bileşenleri (DESIGN.md §11)
src/constants/theme.ts   tasarım token'ları (tek kaynak)
src/hooks/
src/lib/supabase.ts      tek Supabase istemcisi
src/types/database.ts    Supabase veritabanı tipleri
supabase/migrations/     numaralı SQL migration'ları
supabase/functions/      Edge Function'lar (Deno, tsconfig'den hariç)
docs/                    ROADMAP, SECURITY, ARCHITECTURE, DESIGN
```
- Ekranlar ve bileşenler **asla** doğrudan `supabase.from(...)` / `supabase.rpc(...)` çağırmaz. Her zaman `features/*/api.ts` (veya hooks) üzerinden geçer.
- `src/app/` içine ekran olmayan dosya koyma (her dosya bir route olur).
- Özellik klasörü, o özelliğe başlanınca açılır.

## 4. Güvenlik kuralları (kesin)
- Hassas akışlar (ilan oluşturma/kaldırma, istek gönderme, kabul/red, takas onayı/iptal, puanlama, konum, sola kaydırma) **sadece RPC** ile yapılır: `create_listing`, `remove_listing`, `get_feed`, `record_swipe_left`, `send_swap_request`, `respond_swap_request`, `confirm_swap`, `cancel_swap`, `submit_rating`, `set_my_location`. İstemciye güvenilmez, kurallar sunucuda.
- İstemcinin doğrudan yazabildikleri: `profiles` (username, display_name, avatar_url, bio), `listings` (description, condition, photo_urls), `messages` insert, `blocks`, `reports`.
- **service_role / secret key hiçbir yerde kullanılmaz.** Uygulamada sadece publishable (anon) key bulunur. service_role yalnızca Edge Function içinde, Supabase secret'ı olarak.
- Her yeni tablo **RLS açık** ve politikalı oluşturulur.
- RAWG anahtarı veya herhangi bir sır mobil kodda, commit'te, logda olmaz. `.env` içeriği yazdırılmaz.
- Konum tam adres olarak saklanmaz, başka kullanıcıya koordinat olarak gösterilmez (sadece mesafe).
- Her `security definer` fonksiyonu `set search_path` içerir ve `auth.uid()` kontrolü yapar.
- Storage yolu her zaman `<auth.uid()>/<dosya_adi>`.
Gerekçeler ve kontrol listesi: `docs/SECURITY.md`.

## 5. Veritabanı değişiklik kuralı
Claude Code'un veritabanına erişimi yok. Şema değişikliği gerekirse:
1. Yeni numaralı dosya yaz: `supabase/migrations/000N_kisa_aciklama.sql` (başına amacını yaz).
2. İçeriği kullanıcıya göster, **Supabase SQL Editor'de kullanıcının çalıştırmasını** iste.
3. `src/types/database.ts` dosyasını güncelle.
Mevcut migration dosyaları **asla düzenlenmez** (`0001` zaten uygulandı).

## 6. Kod kuralları
- TypeScript strict. `any` yok (zorunluysa yanına gerekçe yorumu).
- Her ağ çağrısında hata yönetimi. Her ekranda yükleniyor, boş ve hata durumları.
- Kullanıcıya görünen tüm metinler Türkçe. Hata mesajları sade Türkçe (teknik detay değil).
- Supabase istemcisi `src/lib/supabase.ts` dışında oluşturulmaz.
- Gereksiz paket ekleme. Native kod içeren paket Expo Go'da çalışmaz, eklemeden önce kullanıcıya sor.

## 6a. Tasarım
- Tüm arayüz işleri `docs/DESIGN.md`'ye uyar. Yeni ekran ya da bileşenden **önce** o dosyayı oku.
- Renk, yazı, boşluk, yarıçap, cam ve hareket değerleri **sadece** `src/constants/theme.ts` üzerinden. Ekranlarda sabit hex/rgba ve piksel yok.
- Ortak bileşenler `src/components/ui/` içinden; aynı işi gören yenisini yazma.
- Kırmızı = hata, haki = onay. Her ekran dark ve light temada denenir.

## 7. Mağaza ve lisans zorunlulukları
- Şikayet + engelleme (kullanıcı içeriği olan uygulamalar için Apple/Google zorunlu).
- Uygulama içinden **hesap silme** (zorunlu). Bu bir Edge Function ile yapılır, istemcide değil.
- RAWG atfı: "Hakkında" ekranında "Oyun verileri RAWG'dan" + https://rawg.io linki.

## 8. Çalışma akışı (subagent'lar `.claude/agents/`)
Özellik sırası: **db-architect** (şema gerekiyorsa) → **supabase-integration** (api.ts) → **mobile-ui-builder** (ekranlar) → **code-reviewer** → **security-reviewer**.
- Son ikisi her özellikten sonra çalışan hızlı, salt-okunur kapılardır.
- **cyber-security-expert** ve **qa-expert** derin uzmanlardır: büyük bir özellik bitince, yol haritasında her 2-3 adımda bir ve yayın öncesi çalıştırılır. Bulguları düzeltebilirler.
- Yol haritası: `docs/ROADMAP.md`. Küçük adımlarla ilerle, her adımın sonunda kullanıcıya Türkçe özet ver.

## 9. Sık yapılan hatalar
- **`.env`'e yanlış anahtar (2026-10-21):** `EXPO_PUBLIC_SUPABASE_URL` içine secret key yapıştırıldı ve dev bundle'a gömüldü. Anahtar iptal edildi. `src/lib/supabase.ts` artık URL'nin `https://` ile başladığını ve secret key olmadığını kontrol ediyor. `.env` kontrol ederken sadece "dolu mu" değil **biçimini** de doğrula (değeri yazdırmadan).
- **"Route ... is missing the required default export" uyarısı:** Genelde dosya değil, import ettiği bir modül yüklenirken hata fırlatıyordur (ör. `supabase.ts` env hatası). Uyarının üstündeki asıl ERROR satırına bak.
- **PowerShell `>` UTF-16 yazar:** CLI çıktısını dosyaya yazarken Git Bash kullan ya da sonra UTF-8'e çevir.
