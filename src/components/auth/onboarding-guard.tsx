import { useEffect } from 'react'
import { useRouter, usePathname } from 'expo-router'
import { supabase } from '@src/lib/supabase/client'
import { useAuth } from '@src/hooks/useAuth'

/**
 * OnboardingGuard - Komponent sprawdzający stan onboardingu
 * Przekierowuje użytkownika do /onboarding jeśli nie zaakceptował disclaimer
 */
export function OnboardingGuard() {
  const { user, isInitializing } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Nie wykonuj żadnych akcji jeśli:
    // - Sesja się inicjalizuje
    // - Użytkownik nie jest zalogowany
    if (isInitializing || !user) {
      console.log(
        '[OnboardingGuard] Skipping - isInitializing:',
        isInitializing,
        'user:',
        !!user
      )
      return
    }

    const checkOnboardingStatus = async () => {
      try {
        console.log(
          '[OnboardingGuard] Checking onboarding status for path:',
          pathname
        )

        // Jeśli jesteśmy na stronach autoryzacji, nie przekierowuj
        if (
          pathname?.startsWith('/auth') ||
          pathname?.startsWith('/(public)')
        ) {
          console.log('[OnboardingGuard] Skipping - on auth/public page')
          return
        }

        // Jeśli jesteśmy już na stronie onboarding (dowolny krok), nie przekierowuj
        if (pathname?.startsWith('/onboarding')) {
          console.log('[OnboardingGuard] Skipping - already on onboarding')
          return
        }

        // Pobierz status onboardingu z bazy
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('disclaimer_accepted_at')
          .eq('id', user.id)
          .maybeSingle() // Użyj maybeSingle() zamiast single() - nie rzuca błędu gdy brak rekordu

        // Jeśli wystąpił błąd (ale nie "brak rekordu"), zaloguj i kontynuuj
        if (error) {
          console.error('Error fetching profile:', error)
          // Nie przerywaj - może to być tymczasowy błąd
          return
        }

        // Przekieruj odpowiednio:
        // Jeśli profil nie istnieje LUB disclaimer nie zaakceptowany → onboarding
        if (!profile || !profile.disclaimer_accepted_at) {
          console.log(
            'Profile not found or disclaimer not accepted, redirecting to onboarding'
          )
          router.replace('/onboarding')
          return
        }

        // Jeśli mamy profil z zaakceptowanym disclaimer i jesteśmy na tabs - wszystko OK
        console.log(
          '[OnboardingGuard] User has profile with accepted disclaimer, all good'
        )
      } catch (err) {
        console.error('Error checking onboarding status:', err)
      }
    }

    checkOnboardingStatus()
  }, [user, isInitializing, pathname, router])

  // Ten komponent nie renderuje nic
  return null
}
