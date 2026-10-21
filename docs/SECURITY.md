# Güvenlik

## Kurallar ve gerekçeleri

| Kural | Neden |
|---|---|
| Hassas akışlar (ilan, istek, kabul/red, onay, iptal, puan, konum, kaydırma) **sadece RPC** ile yapılır | Mobil uygulama kullanıcının elindedir: kod değiştirilebilir, istekler elle gönderilebilir. Kurallar (sahiplik, durum, limit, engel) sunucuda olmazsa atlatılır. |
| Uygulamada **sadece publishable (anon) key** bulunur, service_role/secret key asla bulunmaz | `EXPO_PUBLIC_` değişkenleri uygulama paketine gömülür, herkes çıkarabilir. Publishable key tek başına zararsızdır çünkü RLS'e tabidir. service_role RLS'i tamamen atlar ve sızarsa tüm veritabanı açılır. |
| Her tablo **RLS açık + politikalı** doğar | Supabase tabloları PostgREST ile internete açıktır. RLS kapalı bir tablo, anahtarı bilen herkese açıktır. |
| RAWG anahtarı ve diğer sırlar kodda, commit'te ve logda olmaz | Git geçmişine giren sır silinse de geçmişte kalır. RAWG anahtarı Edge Function secret'ı (`RAWG_API_KEY`) olarak durur. |
| Konum tam adres olarak saklanmaz, başkasına koordinat gösterilmez | Yüz yüze buluşulan bir uygulamada ev adresinin sızması fiziksel güvenlik riskidir. Koordinat ~1 km'ye yuvarlanır, karşı tarafa sadece mesafe gider. |
| `security definer` fonksiyonları `search_path` ayarlar ve `auth.uid()` kontrol eder | Bu fonksiyonlar tablo sahibi yetkisiyle çalışır ve RLS'i atlar. `search_path` sabit değilse saldırgan aynı isimli sahte bir nesneyle fonksiyonu kandırabilir. `auth.uid()` kontrolü yoksa herkes başkası adına işlem yapabilir. |
| Fonksiyonlarda `revoke ... from public, anon` + `grant ... to authenticated` | Giriş yapmamış biri RPC'leri çağıramamalı. |
| Storage yolu `<auth.uid()>/<dosya>` | Politika ilk klasör adına bakar, böylece kimse başkasının klasörüne yazamaz. |
| Ekranlar veriye sadece `features/*/api.ts` üzerinden ulaşır | Hangi tabloya nasıl erişildiğini tek yerden denetleyebilmek için. |
| Engelleme ve görünürlük kuralları sunucuda uygulanır | Sadece arayüzde gizlemek yetmez, API'yi doğrudan çağıran biri yine görür. |
| Hesap silme Edge Function ile yapılır | Kullanıcı silmek service_role ister. Bu anahtar sadece sunucuda bulunabilir. |

## Açık konular (şemayı incelerken bulundu, ilgili adımda düzeltilecek)

| # | Önem | Konu | Öneri | Adım |
|---|---|---|---|---|
| 1 | Yüksek | `get_feed` mesafeyi 0,1 km hassasiyetle döndürüyor. Sahte konumla üç noktadan ölçüm yapılarak (üçgenleme) kişinin yeri bulunabilir. | Mesafeyi aralığa çevir ("1 km'den yakın", "1-3 km", "3-10 km", "10+ km"), `set_my_location` için sıklık sınırı (ör. 1 saatte 1). Migration 0002. | 9 |
| 2 | Orta | `create_listing` oyun adını ve kapak URL'sini istemciden alıyor, `games` tablosunda ilk yazan kazanıyor. Sahte ad/kapak herkese görünebilir. | Oyun bilgisini sunucu tarafında RAWG'dan doğrula (Edge Function ile `create_listing` öncesi kayıt ya da imzalı veri). | 2 |
| 3 | Orta | `create_listing` / ilan güncellemesi `photo_urls` içeriğini doğrulamıyor. Herhangi bir dış URL yazılabilir. | URL'lerin kendi `listing-photos/<uid>/` yolunu gösterdiğini kontrol eden doğrulama (RPC + update trigger). | 2 |
| 4 | Düşük | `listing-photos` ve `avatars` bucket'ları herkese açık. URL'yi bilen, giriş yapmadan görebilir. | Bilinçli karar olarak kabul et ya da private bucket + signed URL'e geç. Dosya adları tahmin edilemez (rastgele) olmalı. | 2 |
| 5 | Düşük | `storage_update_own_folder` politikasında `with check` yok. Dosya başka klasöre taşınabilir. | `with check` ekleyen migration. | 2 |
| 6 | Orta | Görünürlük kuralı "90 günde 3 farklı kişiden şikayet = gizle". Üç sahte hesapla biri susturulabilir. | Hesap yaşı / tamamlanmış takas şartı, şikayet ağırlığı. cyber-security-expert incelemesi. | 8 |
| 7 | Bilgi | Oturum token'ları AsyncStorage'da şifresiz duruyor (Supabase'in resmi rehberi şifreli `LargeSecureStore` öneriyor, 3 ek paket gerekir). | Yayın öncesi değerlendir. | 11 |
| 9 | Orta | Kullanıcı adı benzersizliği büyük/küçük harfe duyarlı: `Ali` ve `ali` ayrı hesap olabilir, taklit (impersonation) riski. | `lower(username)` üzerinde benzersiz indeks (migration 0002, SQL Editor). | 8 |
| 8 | Bilgi | `search-games` için "Verify JWT" kapalı. Fonksiyon girişi kendi kontrol ediyor ama hız sınırı yok. | Kullanıcı başına basit oran sınırı (rate limit) düşün. | 2 |

## Yayına çıkmadan önce kontrol listesi
- [ ] Tüm tablolarda RLS açık. Panel > Database > Tables'da "RLS disabled" uyarısı yok, Security Advisor temiz.
- [ ] Repo ve git geçmişinde sır yok (`service_role`, `sb_secret_`, RAWG anahtarı, `.env`).
- [ ] Uygulamada sadece `EXPO_PUBLIC_SUPABASE_URL` ve publishable key var.
- [ ] Tüm `security definer` fonksiyonlarında `search_path` + `auth.uid()` kontrolü + `anon`'dan revoke var.
- [ ] Storage politikaları sadece kendi klasöre yazmaya izin veriyor, mime ve boyut sınırları açık.
- [ ] Hiçbir API yanıtında, hata mesajında veya Realtime olayında koordinat yok. Mesafe aralık olarak gösteriliyor.
- [ ] Engelleme akışta, profilde, isteklerde ve mesajlarda sunucu tarafında uygulanıyor.
- [ ] Şikayet ve engelleme her kullanıcı içeriğinden (ilan, profil, sohbet) erişilebilir.
- [ ] Hesap silme uygulama içinden çalışıyor, Edge Function ile yapılıyor.
- [ ] Auth: e-posta doğrulama açık, parola uzunluğu ≥ 8, Supabase oran sınırları uygun.
- [ ] `npm audit` kritik bulgu yok, kullanılmayan paket yok.
- [ ] RAWG atfı "Hakkında" ekranında.
- [ ] cyber-security-expert ve qa-expert son incelemesi yapıldı, bulgular kapatıldı.
