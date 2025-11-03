/**
 * Komponent owijający chronione ekrany
 * Automatycznie pokazuje modal logowania dla niezalogowanych użytkowników
 */
import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
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
  const { user } = useAuth()
  const { showAuthModal } = useAuthModalStore()
  const isFocused = useIsFocused()
  const hasShownModal = useRef(false)

  const isAuthenticated = !!user

  useEffect(() => {
    // Resetuj flagę gdy ekran jest blur
    if (!isFocused) {
      hasShownModal.current = false
    }
  }, [isFocused])

  useEffect(() => {
    // Pokazuj modal tylko gdy:
    // 1. Ekran jest aktywny (focused)
    // 2. Użytkownik nie jest zalogowany
    // 3. Modal nie był jeszcze pokazany dla tego focusu
    if (isFocused && !isAuthenticated && !hasShownModal.current) {
      hasShownModal.current = true
      showAuthModal(showSignup ? 'signup' : 'signin')
    }
  }, [isFocused, isAuthenticated, showSignup, showAuthModal])

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
