import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '@/lib/errors';

// Form gönderimleri için: aynı anda tek istek (çift dokunmayı engeller),
// yüklenme durumu ve sade Türkçe hata mesajı.
export function useSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    if (busy.current) return undefined;
    busy.current = true;
    setSubmitting(true);
    setError(null);
    try {
      return await action();
    } catch (e) {
      setError(getErrorMessage(e));
      return undefined;
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }, []);

  return { run, submitting, error, setError };
}
