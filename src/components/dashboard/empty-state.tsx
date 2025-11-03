/**
 * EmptyState Component
 *
 * Stan pusty dla Dashboard gdy brak posiłków:
 * - Ilustracja/ikona
 * - Komunikat
 * - Przycisk "Generuj plan"
 */

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'

interface EmptyStateProps {
  onGenerate: () => void
  isGenerating?: boolean
}

/**
 * Stan pusty - brak posiłków na dzień
 */
export function EmptyState({
  onGenerate,
  isGenerating = false,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Ikona */}
      <View style={styles.iconContainer}>
        <IconSymbol name='fork.knife.circle' size={64} color='#9ca3af' />
      </View>

      {/* Komunikat */}
      <Text style={styles.title}>Brak posiłków na ten dzień</Text>
      <Text style={styles.description}>
        Wygeneruj plan posiłków na cały tydzień, aby móc śledzić swoje
        makroskładniki
      </Text>

      {/* Przycisk generowania */}
      <TouchableOpacity
        style={[styles.button, isGenerating && styles.buttonDisabled]}
        onPress={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color='#ffffff' />
        ) : (
          <>
            <IconSymbol name='sparkles' size={20} color='#ffffff' />
            <Text style={styles.buttonText}>Generuj plan na tydzień</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Dodatkowe info */}
      <Text style={styles.hint}>
        Plan zostanie wygenerowany na podstawie Twoich celów kalorycznych i
        preferencji
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5A31F4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
})
