// Supabase / ağ hatalarını kullanıcıya gösterilebilecek sade Türkçe mesajlara çevirir.
// Teknik hata metni asla arayüze gitmez; api katmanı hataları buradan geçirip fırlatır.

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}

const GENERIC_MESSAGE = 'Bir şeyler ters gitti. Lütfen tekrar dene.';
const NETWORK_MESSAGE = 'İnternet bağlantını kontrol edip tekrar dene.';
const RATE_LIMIT_MESSAGE = 'Çok fazla deneme yaptın. Biraz bekleyip tekrar dene.';

// Supabase Auth (error.code) ve Postgres (error.code, ör. 23505) kodları
const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-posta ya da parola hatalı.',
  email_not_confirmed: 'E-postanı doğrulaman gerekiyor. Gelen kutunu kontrol et.',
  user_already_exists: 'Bu e-posta ile zaten bir hesap var.',
  email_exists: 'Bu e-posta ile zaten bir hesap var.',
  weak_password: 'Parola çok zayıf. En az 8 karakter kullan.',
  email_address_invalid: 'Geçerli bir e-posta adresi gir.',
  validation_failed: 'Girdiğin bilgiler geçersiz.',
  signup_disabled: 'Şu an yeni kayıt alınamıyor.',
  over_request_rate_limit: RATE_LIMIT_MESSAGE,
  over_email_send_rate_limit: RATE_LIMIT_MESSAGE,
  '23505': 'Bu kullanıcı adı alınmış. Başka bir tane dene.',
  '23514': 'Girdiğin bilgiler geçersiz.',
  '42501': 'Bu işlem için yetkin yok.',
};

type ErrorShape = { message?: unknown; code?: unknown; status?: unknown };

function asShape(error: unknown): ErrorShape {
  return typeof error === 'object' && error !== null ? (error as ErrorShape) : {};
}

export function toUserError(error: unknown): UserFacingError {
  if (error instanceof UserFacingError) return error;

  const { message, code, status } = asShape(error);
  const text = typeof message === 'string' ? message.toLowerCase() : '';

  if (typeof code === 'string' && code in CODE_MESSAGES) {
    return new UserFacingError(CODE_MESSAGES[code]);
  }
  if (status === 429) return new UserFacingError(RATE_LIMIT_MESSAGE);
  if (text.includes('network') || text.includes('failed to fetch') || text.includes('timeout')) {
    return new UserFacingError(NETWORK_MESSAGE);
  }
  return new UserFacingError(GENERIC_MESSAGE);
}

export function getErrorMessage(error: unknown): string {
  return toUserError(error).message;
}
