/**
 * useAuth Hook for React Native
 *
 * Custom hook for authentication operations with Supabase Auth in React Native
 * Handles login, registration, password reset with Expo Router navigation
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'expo-router'
import Toast from 'react-native-toast-message'
import { supabase } from '@src/lib/supabase/client'
import { translateAuthError } from '@src/lib/utils/auth-errors'
import type { UseAuthReturn } from '@src/types/auth-view.types'

/**
 * Hook do zarządzania autentykacją użytkownika w React Native
 *
 * @param redirectTo - Opcjonalna ścieżka do przekierowania po zalogowaniu (domyślnie: '/(app)')
 * @returns Metody autentykacji i stan ładowania/błędów
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { login, isLoading, error } = useAuth('/(app)/dashboard')
 *
 *   const handleSubmit = async (email: string, password: string) => {
 *     await login(email, password)
 *   }
 * }
 * ```
 */
export function useAuth(redirectTo?: string): UseAuthReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        // Handle invalid refresh token - clear corrupted session
        if (error) {
          console.warn(
            '[useAuth] Session error, clearing auth state:',
            error.message
          )
          supabase.auth.signOut().catch(() => {
            // Ignore signOut errors - we just want to clear local state
          })
          setUser(null)
          setIsInitializing(false)
          return
        }

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          })
        }
        setIsInitializing(false)
      })
      .catch((err) => {
        // Catch any unexpected errors during session retrieval
        console.warn('[useAuth] Unexpected session error:', err.message)
        setUser(null)
        setIsInitializing(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Logowanie z email i hasłem
   */
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // Logowanie przez Supabase Auth
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (authError) throw authError

        // Sprawdź czy profil użytkownika istnieje
        const { data: profile } = await supabase
          .from('profiles')
          .select('disclaimer_accepted_at')
          .eq('id', data.user.id)
          .maybeSingle() // Użyj maybeSingle() - nie rzuca błędu gdy brak rekordu

        // Przekieruj odpowiednio
        // Jeśli profil nie istnieje → onboarding (zalogowany musi utworzyć profil)
        // Jeśli profil istnieje ale disclaimer nie zaakceptowany → onboarding
        // Jeśli profil istnieje i disclaimer zaakceptowany → app
        if (!profile || !profile.disclaimer_accepted_at) {
          router.replace('/onboarding')
        } else {
          router.replace((redirectTo || '/(app)') as any)
        }

        Toast.show({
          type: 'success',
          text1: 'Zalogowano pomyślnie',
          text2: 'Witaj ponownie!',
        })
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        Toast.show({
          type: 'error',
          text1: 'Błąd logowania',
          text2: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [router, redirectTo]
  )

  /**
   * Rejestracja z email i hasłem
   */
  const register = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // Rejestracja przez Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          // Note: Deep linking dla email confirmation będzie dodane później
        })

        if (authError) throw authError

        // Supabase może automatycznie zalogować po rejestracji
        if (data.user && data.session) {
          // Przekieruj do onboardingu
          router.replace('/onboarding')
          Toast.show({
            type: 'success',
            text1: 'Konto utworzone',
            text2: 'Witaj w LowCarbPlaner!',
          })
        } else {
          // Wymaga potwierdzenia email
          Toast.show({
            type: 'success',
            text1: 'Sprawdź swoją skrzynkę',
            text2: 'Wysłaliśmy link aktywacyjny na Twój email.',
            visibilityTime: 5000,
          })
        }
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        Toast.show({
          type: 'error',
          text1: 'Błąd rejestracji',
          text2: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  /**
   * Logowanie przez Google OAuth
   * Note: Wymaga konfiguracji OAuth w Supabase Dashboard
   */
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implementacja OAuth dla React Native z deep linking
      Toast.show({
        type: 'info',
        text1: 'Google OAuth',
        text2: 'Ta funkcja będzie dostępna wkrótce',
      })
      setIsLoading(false)
    } catch (err: any) {
      const errorMessage = translateAuthError(err.message)
      setError(errorMessage)
      Toast.show({
        type: 'error',
        text1: 'Błąd logowania',
        text2: errorMessage,
      })
      setIsLoading(false)
    }
  }, [])

  /**
   * Wysyłka email z linkiem do resetowania hasła
   */
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email
        // TODO: Dodać deep link redirect po skonfigurowaniu
      )

      if (authError) throw authError

      Toast.show({
        type: 'success',
        text1: 'Email wysłany',
        text2: 'Sprawdź swoją skrzynkę i kliknij w link resetujący hasło.',
        visibilityTime: 5000,
      })
    } catch (err: any) {
      const errorMessage = translateAuthError(err.message)
      setError(errorMessage)
      Toast.show({
        type: 'error',
        text1: 'Błąd',
        text2: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Aktualizacja hasła (po kliknięciu link z email)
   */
  const updatePassword = useCallback(
    async (password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: authError } = await supabase.auth.updateUser({
          password,
        })

        if (authError) throw authError

        Toast.show({
          type: 'success',
          text1: 'Hasło zmienione',
          text2: 'Możesz teraz zalogować się nowym hasłem.',
        })

        router.replace('/auth/login')
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        Toast.show({
          type: 'error',
          text1: 'Błąd',
          text2: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  /**
   * Wylogowanie użytkownika
   */
  const logout = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signOut()

      if (authError) throw authError

      setUser(null)
      router.replace('/auth/login' as any)

      Toast.show({
        type: 'success',
        text1: 'Wylogowano',
        text2: 'Do zobaczenia!',
      })
    } catch (err: any) {
      const errorMessage = translateAuthError(err.message)
      setError(errorMessage)
      Toast.show({
        type: 'error',
        text1: 'Błąd wylogowania',
        text2: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return {
    isLoading,
    error,
    user,
    isInitializing,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    updatePassword,
    logout,
  }
}
