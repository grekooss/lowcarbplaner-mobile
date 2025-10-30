import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Konfiguracja Query Client z optymalnymi ustawieniami
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dane są świeże przez 1 minutę
      staleTime: 60 * 1000,
      // Cache wygasa po 5 minutach
      gcTime: 5 * 60 * 1000,
      // Ponów zapytanie 1 raz w przypadku błędu
      retry: 1,
      // Nie odświeżaj automatycznie przy focus okna (mobilne)
      refetchOnWindowFocus: false,
      // Odświeżaj przy reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Ponów mutację 0 razy (nie ponawiaj automatycznie)
      retry: 0,
    },
  },
})

interface AppQueryClientProviderProps {
  children: ReactNode
}

/**
 * Provider dla TanStack Query (React Query)
 * Opakowuje aplikację i umożliwia korzystanie z hooków query i mutation
 *
 * @example
 * ```tsx
 * <AppQueryClientProvider>
 *   <YourApp />
 * </AppQueryClientProvider>
 * ```
 */
export function AppQueryClientProvider({
  children,
}: AppQueryClientProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Eksportuj queryClient dla testów i użytku poza komponentami
export { queryClient }
