/**
 * ErrorState Component
 *
 * Reusable error state z retry button:
 * - Ikona błędu
 * - Tytuł i opis
 * - Retry button
 * - Opcjonalna akcja dodatkowa
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  isRetrying?: boolean
}

/**
 * Error state z retry button
 */
export function ErrorState({
  title = 'Coś poszło nie tak',
  message = 'Nie udało się załadować danych. Spróbuj ponownie.',
  onRetry,
  retryLabel = 'Spróbuj ponownie',
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol
          name='exclamationmark.triangle.fill'
          size={64}
          color='#ef4444'
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
          onPress={onRetry}
          disabled={isRetrying}
        >
          <IconSymbol name='arrow.clockwise' size={18} color='#ffffff' />
          <Text style={styles.retryButtonText}>
            {isRetrying ? 'Ładowanie...' : retryLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5A31F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
})
