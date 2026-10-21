import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useSession } from '@/features/auth/hooks';
import { getErrorMessage, UserFacingError } from '@/lib/errors';

import { getMyProfile, setMyAvatar, updateMyProfile } from '../api';
import { ProfileContext } from '../hooks';
import type { PickedImage, Profile, ProfileUpdate } from '../types';

type LoadResult = { userId: string; profile: Profile | null; error: string | null };

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;

  const [result, setResult] = useState<LoadResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getMyProfile(userId)
      .then((profile) => {
        if (active) setResult({ userId, profile, error: null });
      })
      .catch((error: unknown) => {
        if (active) setResult({ userId, profile: null, error: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  // Sonuç bu kullanıcıya ait değilse (ilk açılış, hesap değişimi, yeniden deneme) yükleniyor sayılır.
  const current = userId && result?.userId === userId ? result : null;
  const loading = userId !== null && current === null;

  const refresh = useCallback(() => {
    setResult(null);
    setReloadKey((key) => key + 1);
  }, []);

  const save = useCallback(
    async (patch: ProfileUpdate): Promise<Profile> => {
      if (!userId) throw new UserFacingError('Önce giriş yapmalısın.');
      const profile = await updateMyProfile(userId, patch);
      setResult({ userId, profile, error: null });
      return profile;
    },
    [userId],
  );

  const profile = current?.profile ?? null;
  const previousAvatar = profile?.avatar_url ?? null;

  const changeAvatar = useCallback(
    async (image: PickedImage): Promise<Profile> => {
      if (!userId) throw new UserFacingError('Önce giriş yapmalısın.');
      const updated = await setMyAvatar(userId, image, previousAvatar);
      setResult({ userId, profile: updated, error: null });
      return updated;
    },
    [userId, previousAvatar],
  );

  const value = useMemo(
    () => ({ profile, loading, error: current?.error ?? null, refresh, save, changeAvatar }),
    [profile, loading, current, refresh, save, changeAvatar],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
