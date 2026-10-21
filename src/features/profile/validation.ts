// Sunucudaki kurallarla aynı (schema: username ~ '^[a-zA-Z0-9_]{3,20}$', bio <= 300).
// İstemci doğrulaması sadece kullanıcıya hızlı geri bildirim içindir; asıl kontrol veritabanında.

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
// Kayıtta trigger'ın verdiği geçici ad: user_ + kullanıcı id'sinin ilk 8 hanesi
const PLACEHOLDER_USERNAME_PATTERN = /^user_[0-9a-f]{8}$/i;

export const USERNAME_MAX = 20;
export const DISPLAY_NAME_MAX = 40;
export const BIO_MAX = 300;

export function isPlaceholderUsername(username: string): boolean {
  return PLACEHOLDER_USERNAME_PATTERN.test(username);
}

export function validateUsername(username: string): string | null {
  if (!USERNAME_PATTERN.test(username)) {
    return 'Kullanıcı adı 3-20 karakter olmalı; sadece harf, rakam ve _ kullanılabilir.';
  }
  if (isPlaceholderUsername(username)) {
    return 'Bu kullanıcı adı kullanılamaz. Başka bir tane seç.';
  }
  return null;
}

export function validateDisplayName(value: string): string | null {
  return value.length > DISPLAY_NAME_MAX ? `Görünen ad en fazla ${DISPLAY_NAME_MAX} karakter olabilir.` : null;
}

export function validateBio(value: string): string | null {
  return value.length > BIO_MAX ? `Hakkında kısmı en fazla ${BIO_MAX} karakter olabilir.` : null;
}
