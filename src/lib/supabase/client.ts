/**
 * Supabase Client for React Native
 *
 * Konfiguracja Supabase client z AsyncStorage dla React Native.
 * Automatycznie zarządza sesją użytkownika w aplikacji mobilnej.
 *
 * WAŻNE:
 * - Używa AsyncStorage do persystencji sesji
 * - RLS automatycznie filtruje dane na podstawie sesji użytkownika
 * - Auto-refresh token włączony
 *
 * @see https://supabase.com/docs/reference/javascript/initializing
 */

import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Database } from '@src/types/database.types'

/**
 * Singleton instance Supabase client dla React Native
 */
let client: ReturnType<typeof createClient<Database>> | undefined

/**
 * Tworzy lub zwraca singleton Supabase client dla React Native
 *
 * @returns Supabase client z automatyczną obsługą sesji
 *
 * @example
 * ```typescript
 * import { supabase } from '@/lib/supabase/client'
 *
 * // W komponencie lub hooku
 * const { data } = await supabase
 *   .from('planned_meals')
 *   .select('*')
 *   .eq('meal_date', today)
 * ```
 */
export function createSupabaseClient() {
  if (client) {
    return client
  }

  client = createClient<Database>(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Nie używamy deep links dla auth w tej wersji
      },
    }
  )

  return client
}

/**
 * Eksport domyślnej instancji Supabase client
 * Można używać bezpośrednio bez wywoływania funkcji
 */
export const supabase = createSupabaseClient()
