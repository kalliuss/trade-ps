import { toUserError, UserFacingError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

import type { PickedImage, Profile, ProfileUpdate } from './types';

const AVATAR_BUCKET = 'avatars';
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // bucket sınırıyla aynı (2 MB)
const AVATAR_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function getMyProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw toUserError(error);
  return data;
}

export async function updateMyProfile(userId: string, patch: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw toUserError(error);
  return data;
}

// Avatarı <kullanici_id>/<rastgele_ad>.<uzanti> yoluna yükler, profili günceller,
// eski dosyayı (varsa) temizler. Güncel profili döndürür.
export async function setMyAvatar(
  userId: string,
  image: PickedImage,
  previousUrl: string | null,
): Promise<Profile> {
  const extension = image.mimeType ? AVATAR_TYPES[image.mimeType] : undefined;
  if (!extension || !image.mimeType) {
    throw new UserFacingError('Sadece JPEG, PNG veya WebP fotoğraf yükleyebilirsin.');
  }

  let body: ArrayBuffer;
  try {
    const response = await fetch(image.uri);
    body = await response.arrayBuffer();
  } catch (error) {
    throw toUserError(error);
  }
  if (body.byteLength > AVATAR_MAX_BYTES) {
    throw new UserFacingError('Fotoğraf çok büyük. En fazla 2 MB olabilir.');
  }

  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, body, { contentType: image.mimeType, upsert: false });
  if (uploadError) throw toUserError(uploadError);

  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  let profile: Profile;
  try {
    profile = await updateMyProfile(userId, { avatar_url: urlData.publicUrl });
  } catch (error) {
    // Profil güncellenemediyse yüklenen dosya sahipsiz kalmasın.
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    throw error;
  }

  await removeOldAvatar(userId, previousUrl);
  return profile;
}

// Eski avatar dosyasını silmeyi dener; başarısız olursa kullanıcıya hata göstermez.
async function removeOldAvatar(userId: string, previousUrl: string | null): Promise<void> {
  if (!previousUrl) return;
  const marker = `/${AVATAR_BUCKET}/`;
  const index = previousUrl.indexOf(marker);
  if (index === -1) return;
  const oldPath = previousUrl.slice(index + marker.length);
  if (!oldPath.startsWith(`${userId}/`)) return;
  await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
}
