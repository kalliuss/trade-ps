import { createContext, useContext } from 'react';

import type { PickedImage, Profile, ProfileUpdate } from './types';

export type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  // Profil yüklenemediyse yeniden dener.
  refresh: () => void;
  // Başarılıysa güncel profili döndürür, hata olursa UserFacingError fırlatır.
  save: (patch: ProfileUpdate) => Promise<Profile>;
  changeAvatar: (image: PickedImage) => Promise<Profile>;
};

export const ProfileContext = createContext<ProfileState | null>(null);

export function useMyProfile(): ProfileState {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useMyProfile, ProfileProvider içinde kullanılmalı.');
  return value;
}
