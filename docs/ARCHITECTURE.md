# Mimari

## Arayüz katmanı
- `src/constants/theme.ts`: tasarım token'ları (renk dark/light, tipografi, boşluk, yarıçap, cam, hareket). Tek kaynak.
- `src/components/ui/`: tasarım sistemi bileşenleri (GlassView, PillButton, Chip, GlassTabBar, GameCard, SwipeDeck...). Kurallar `docs/DESIGN.md`.
- Ekranlar → `ui/` bileşenleri → token'lar. Ekranlarda sabit renk/boyut yok.

## Veri akışı
```
[Ekran: src/app/*]  ──kullanır──▶  [hooks.ts]  ──çağırır──▶  [features/*/api.ts]
                                                                   │
                                                     src/lib/supabase.ts (tek istemci,
                                                     publishable key, AsyncStorage oturum)
                                                                   │
            ┌──────────────────┬───────────────────┬──────────────┼──────────────────┐
            ▼                  ▼                   ▼              ▼                  ▼
     PostgREST tablo     RPC fonksiyonları     Storage        Realtime        Edge Function
     (RLS ile okuma,     (security definer,    (listing-     (messages,       search-games
     izinli az yazma)    tüm kritik kurallar)  photos,       swap_requests)        │
                                               avatars)                            ▼
                                                                              RAWG API
                                                                          (RAWG_API_KEY secret)
```
Kural: Ekranlar `supabase` nesnesini hiç görmez. Hata mesajları api katmanında sade Türkçeye çevrilir.

## Tablolar arası ilişkiler
- `auth.users` 1─1 `profiles` (kayıtta trigger ile oluşur) 1─1 `profile_locations` (özel, sadece sahibi görür)
- `profiles` 1─N `listings` N─1 `games` (RAWG önbelleği, id = RAWG id)
- `profiles` + `listings` → `swipes` (kim hangi ilanı kaydırdı, PK: swiper+listing)
- `swap_requests`: requester → owner, `target_listing` (istenen) + `offered_listing` (teklif edilen)
- `swap_requests` 1─1 `conversations` 1─N `messages`
- `swap_requests` 1─N `ratings` (takas başına kişi başı 1 puan) → `profiles.rating_avg/count` (trigger)
- `blocks` (blocker → blocked), `reports` (reporter → reported_user, isteğe bağlı listing)
- Tüm kullanıcı verileri `on delete cascade` ile `profiles`/`auth.users`'a bağlıdır (hesap silme hepsini temizler).

## Durum makineleri
- **İlan:** `open` → `reserved` (istek kabul edilince) → `swapped` (iki taraf onaylayınca). `reserved` → `open` (kabul sonrası iptal). `open` → `removed` (sahibi kaldırır).
- **İstek:** `pending` → `accepted` | `declined` | `cancelled`. `accepted` → `completed` (iki onay) | `cancelled`.

## İşlem → sunucu eşlemesi
| Kullanıcı işlemi | Nereye gider |
|---|---|
| Kayıt / giriş / çıkış | Supabase Auth (`supabase.auth.*`) + `handle_new_user` trigger |
| Profil düzenleme | `profiles` update (sadece username, display_name, avatar_url, bio) |
| Avatar / disk fotoğrafı yükleme | Storage `avatars` / `listing-photos`, yol `<uid>/<dosya>` |
| Oyun arama | Edge Function `search-games` → RAWG |
| İlan oluşturma | RPC `create_listing` |
| İlan açıklama/durum/fotoğraf düzenleme | `listings` update (sadece open ve kendi ilanı) |
| İlan kaldırma | RPC `remove_listing` (bekleyen istekleri de iptal eder) |
| Kart akışı | RPC `get_feed` (engel, konum, görünürlük, kaydırılmışları filtreler) |
| Sola kaydırma | RPC `record_swipe_left` |
| Sağa kaydırma (istek) | RPC `send_swap_request` (24 saatte 50 limit) |
| Gelen isteği kabul/red | RPC `respond_swap_request` (kabulde ilanları rezerve eder, sohbet açar) |
| İstek geri çekme / takas iptali | RPC `cancel_swap` |
| Takas gerçekleşti onayı | RPC `confirm_swap` |
| Puan verme | RPC `submit_rating` |
| Mesaj gönderme / okuma | `messages` insert / select + Realtime |
| İstek bildirimleri (uygulama açıkken) | Realtime `swap_requests` |
| Engelle / engeli kaldır | `blocks` insert / delete |
| Şikayet | `reports` insert |
| Konum ayarı | RPC `set_my_location` |
| Hesap silme (planlı) | Edge Function `delete-account` (service_role sadece sunucuda) |
