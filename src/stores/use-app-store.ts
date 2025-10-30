import { create } from 'zustand'

/**
 * App State interface - globalny stan aplikacji
 */
interface AppState {
  // UI State
  isOnline: boolean
  isDarkMode: boolean

  // Settings
  language: 'pl' | 'en'
  dailyCarbsLimit: number

  // Actions
  setOnlineStatus: (isOnline: boolean) => void
  toggleDarkMode: () => void
  setLanguage: (language: 'pl' | 'en') => void
  setDailyCarbsLimit: (limit: number) => void
}

/**
 * Zustand Store dla globalnego stanu aplikacji
 *
 * @example
 * ```tsx
 * const { isDarkMode, toggleDarkMode } = useAppStore()
 * ```
 */
export const useAppStore = create<AppState>((set) => ({
  // Stan początkowy
  isOnline: true,
  isDarkMode: false,
  language: 'pl',
  dailyCarbsLimit: 50, // gramy

  // Akcje
  setOnlineStatus: (isOnline) => set({ isOnline }),

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  setLanguage: (language) => set({ language }),

  setDailyCarbsLimit: (limit) => set({ dailyCarbsLimit: limit }),
}))

// Selektory
export const useIsDarkMode = () => useAppStore((state) => state.isDarkMode)
export const useLanguage = () => useAppStore((state) => state.language)
export const useDailyCarbsLimit = () =>
  useAppStore((state) => state.dailyCarbsLimit)
