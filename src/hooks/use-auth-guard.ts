/**
 * Hook do ochrony ekranów przed nieautoryzowanym dostępem
 * Pokazuje modal logowania dla niezalogowanych użytkowników
 */
import { useAuthModalStore } from '@src/stores/use-auth-modal-store'
import { useAuth } from './useAuth'

interface UseAuthGuardOptions {
  /**
   * Czy ekran wymaga autoryzacji
   * @default true
   */
  requireAuth?: boolean
  /**
   * Czy pokazać modal rejestracji zamiast logowania
   * @default false
   */
  showSignup?: boolean
}

/**
 * Hook chroniący ekran przed dostępem niezalogowanych użytkowników
 *
 * @example
 * ```tsx
 * function ProtectedScreen() {
 *   const { isProtected } = useAuthGuard()
 *
 *   if (isProtected) {
 *     return <Text>Zaloguj się, aby zobaczyć treść</Text>
 *   }
 *
 *   return <ProtectedContent />
 * }
 * ```
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { requireAuth = true, showSignup = false } = options
  const { user } = useAuth()
  const { showAuthModal } = useAuthModalStore()

  const isAuthenticated = !!user
  const isProtected = requireAuth && !isAuthenticated

  /**
   * Pokazuje modal autoryzacji gdy użytkownik próbuje wejść na chroniony ekran
   */
  const requestAuth = () => {
    if (isProtected) {
      showAuthModal(showSignup ? 'signup' : 'signin')
    }
  }

  return {
    /**
     * Czy użytkownik jest zalogowany
     */
    isAuthenticated,
    /**
     * Czy ekran jest chroniony (wymaga logowania a użytkownik niezalogowany)
     */
    isProtected,
    /**
     * Funkcja do ręcznego wywołania modala autoryzacji
     */
    requestAuth,
  }
}
