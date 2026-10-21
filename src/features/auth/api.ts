import type { Session } from '@supabase/supabase-js';

import { toUserError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) throw toUserError(error);
  // E-posta doğrulaması açıksa oturum hemen gelmez, kullanıcı maildeki linke tıklamalıdır.
  return { needsEmailConfirmation: data.session === null };
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw toUserError(error);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toUserError(error);
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toUserError(error);
  return data.session;
}

// Oturum değişimlerini dinler; dönen fonksiyon aboneliği kapatır.
export function subscribeToAuthChanges(onChange: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session);
  });
  return () => data.subscription.unsubscribe();
}
