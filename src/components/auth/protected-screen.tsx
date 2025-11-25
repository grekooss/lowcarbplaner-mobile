/**
 * Komponent owijający chronione ekrany
 * Automatycznie pokazuje modal logowania dla niezalogowanych użytkowników
 */
import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import { useAuth } from '@src/hooks/useAuth'
import { useAuthModalStore } from '@src/stores/use-auth-modal-store'

interface ProtectedScreenProps {
  /**
   * Zawartość ekranu dla zalogowanych użytkowników
   */
  children: React.ReactNode
  /**
   * Zawartość placeholder dla niezalogowanych użytkowników
   * Pokazywana gdy modal się zamyka
   */
  placeholder?: React.ReactNode
  /**
   * Czy pokazać modal rejestracji zamiast logowania
   * @default false
   */
  showSignup?: boolean
}

/**
 * Wrapper chroniący ekran - automatycznie pokazuje modal logowania
 *
 * @example
 * ```tsx
 * export default function DashboardScreen() {
 *   return (
 *     <ProtectedScreen
 *       placeholder={
 *         <View>
 *           <Text>Zaloguj się aby zobaczyć dashboard</Text>
 *         </View>
 *       }
 *     >
 *       <DashboardContent />
 *     </ProtectedScreen>
 *   )
 * }
 * ```
 */
export function ProtectedScreen({
  children,
  placeholder,
  showSignup = false,
}: ProtectedScreenProps) {
  const { user, isInitializing } = useAuth()
  const { showAuthModal } = useAuthModalStore()
  const isFocused = useIsFocused()
  const router = useRouter()
  const hasShownModal = useRef(false)

  const isAuthenticated = !!user

  console.log('[ProtectedScreen] User state:', {
    user: !!user,
    email: user?.email,
    isAuthenticated,
  })

  useEffect(() => {
    // Resetuj flagę gdy ekran jest blur
    if (!isFocused) {
      hasShownModal.current = false
    }
  }, [isFocused])

  useEffect(() => {
    // Pokazuj modal tylko gdy:
    // 1. Ekran jest aktywny (focused)
    // 2. Inicjalizacja auth zakończona (nie sprawdzamy już sesji)
    // 3. Użytkownik nie jest zalogowany
    // 4. Modal nie był jeszcze pokazany dla tego focusu
    console.log('[ProtectedScreen] Check:', {
      isFocused,
      isInitializing,
      isAuthenticated,
      hasShownModal: hasShownModal.current,
    })

    if (
      isFocused &&
      !isInitializing &&
      !isAuthenticated &&
      !hasShownModal.current
    ) {
      console.log('[ProtectedScreen] Showing auth modal')
      hasShownModal.current = true
      // Przekaż callback przekierowujący na stronę przepisów po zamknięciu modala
      showAuthModal(showSignup ? 'signup' : 'signin', () => {
        router.replace('/(tabs)/recipes' as any)
      })
    }
  }, [
    isFocused,
    isInitializing,
    isAuthenticated,
    showSignup,
    showAuthModal,
    router,
  ])

  // Jeśli użytkownik zalogowany, pokaż pełną zawartość
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Jeśli niezalogowany, pokaż placeholder lub domyślny komunikat
  if (placeholder) {
    return <>{placeholder}</>
  }

  return (
    <View style={styles.defaultPlaceholder}>
      <Text style={styles.placeholderText}>
        Zaloguj się, aby uzyskać dostęp do tej sekcji
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  defaultPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
})
