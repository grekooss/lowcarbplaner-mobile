import { create } from 'zustand'

/**
 * User interface - reprezentacja zalogowanego użytkownika
 */
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

/**
 * Auth State interface - pełny stan autoryzacji
 */
interface AuthState {
  // Stan
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Akcje
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

/**
 * Zustand Store dla zarządzania autoryzacją użytkownika
 *
 * @example
 * ```tsx
 * // W komponencie
 * const { user, login, logout } = useAuthStore()
 *
 * // Login
 * login({ id: '1', email: 'user@example.com', name: 'Jan Kowalski' })
 *
 * // Logout
 * logout()
 *
 * // Selektory (optymalizacja rerenderów)
 * const user = useAuthStore(state => state.user)
 * const isAuthenticated = useAuthStore(state => state.isAuthenticated)
 * ```
 */
export const useAuthStore = create<AuthState>((set) => ({
  // Stan początkowy
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Akcje
  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),
}))

/**
 * Selektory - pomocnicze hooki dla lepszej optymalizacji
 * Używaj ich zamiast pełnego store gdy potrzebujesz tylko jednej wartości
 */
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
