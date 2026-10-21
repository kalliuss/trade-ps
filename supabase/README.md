# supabase/

Bu klasör veritabanı şemasının ve Edge Function'ların **kaynak kopyasıdır**. Claude Code veritabanına bağlanmaz. Değişiklikleri sen panelden uygularsın.

## Migration uygulama
1. Yeni değişiklikler `migrations/000N_aciklama.sql` dosyası olarak gelir (numara sırası önemlidir).
2. Supabase paneli > **SQL Editor** > New query.
3. Dosyanın tüm içeriğini yapıştır > **Run**.
4. Hata alırsan hiçbir şeyi elle düzeltmeden mesajı Claude'a ilet.
5. Uygulandığını not et (ör. commit mesajında "0002 SQL Editor'de uygulandı").

Kurallar: Uygulanmış bir migration dosyası **asla değiştirilmez**. Düzeltme her zaman yeni numaralı bir dosyayla yapılır. `0001_initial_schema.sql` zaten uygulandı, tekrar çalıştırma (tablolar zaten var, hata verir).

## Edge Function yayınlama (panelden)
1. Panel > **Edge Functions** > fonksiyonu seç (yeni ise "Deploy a new function" > "Via Editor").
2. `functions/<ad>/index.ts` içeriğini editöre yapıştır > **Deploy**.
3. Fonksiyon ayarlarında **Verify JWT**: `search-games` için kapalı (fonksiyon girişi kendisi `auth.getUser()` ile kontrol ediyor). Yeni fonksiyonlarda varsayılan açık bırak, kapatmak gerekirse nedenini kodda yaz.

İleride CLI ile (önce `npx supabase login`):
```bash
npx supabase functions deploy search-games --project-ref hraryfwduchjzfavsnnj --no-verify-jwt
```

## Secret ekleme
Panel > **Edge Functions** > **Secrets** (Manage secrets) > Add new secret.
- `RAWG_API_KEY`: RAWG anahtarı (kayıtlı).
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` fonksiyonlara Supabase tarafından otomatik verilir, elle ekleme.

CLI ile: `npx supabase secrets set RAWG_API_KEY=... --project-ref hraryfwduchjzfavsnnj` (komutu terminal geçmişinde bırakmamaya dikkat et).

Secret'lar **asla** bu repoya, `.env` dosyasına ya da mobil koda yazılmaz.

## Tip üretimi
```bash
npx supabase login
npx supabase gen types typescript --project-id hraryfwduchjzfavsnnj > src/types/database.ts
```
⚠️ Windows PowerShell 5.1'de `>` dosyayı **UTF-16** yazar ve Metro bunu okuyamayabilir. Bu komutu **Git Bash** terminalinde çalıştır ya da PowerShell'de çalıştırdıysan Claude'dan dosyayı UTF-8'e çevirmesini iste.

`src/types/database.ts` 2026-10-21'de CLI ile üretildi (UTF-8'e çevrildi).
