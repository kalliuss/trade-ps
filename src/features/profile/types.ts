import type { Tables } from '@/types/database';

export type Profile = Tables<'profiles'>;

// İstemcinin güncelleyebildiği alanlar (puan alanları sunucuda korunur).
export type ProfileUpdate = {
  username?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
};

// Resim seçiciden gelen dosyanın uploadAvatar için gereken kısmı.
export type PickedImage = {
  uri: string;
  mimeType?: string | null;
};
