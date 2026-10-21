import type { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

export type SessionState = {
  session: Session | null;
  loading: boolean;
};

export const SessionContext = createContext<SessionState | null>(null);

export function useSession(): SessionState {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession, AuthProvider içinde kullanılmalı.');
  return value;
}
