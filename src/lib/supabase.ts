import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/types/database';

// EXPO_PUBLIC_ değişkenleri derleme sırasında koda gömülür; bu yüzden
// process.env.X şeklinde doğrudan (statik) okunmalıdır.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Supabase ayarları eksik: EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
      '.env dosyasında tanımlı olmalı (.env.example dosyasına bak). Değiştirdikten sonra ' +
      '"npx expo start --clear" ile yeniden başlat.',
  );
}

// Yanlış değişkene yanlış değer yapıştırılmasına karşı koruma.
// Secret / service_role anahtarı uygulamaya ASLA girmemeli (RLS'i tamamen atlar).
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL bir adres olmalı (https://<proje>.supabase.co).');
}
if (
  supabasePublishableKey.startsWith('sb_secret_') ||
  supabaseUrl.includes('sb_secret_') ||
  supabasePublishableKey.startsWith('eyJ')
) {
  throw new Error(
    'Uygulamaya secret/service_role anahtarı konmuş! Sadece publishable key (sb_publishable_...) kullan.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Web'de statik render sırasında AsyncStorage yok; orada tarayıcı depolaması kullanılır.
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Uygulama ön plandayken oturum token'ını arka planda yenile, arka plana geçince durdur.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
