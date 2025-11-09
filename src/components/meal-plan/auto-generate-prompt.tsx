/**
 * Auto Generate Prompt Component
 * Prompt user to generate meal plan when meals are missing
 */

import { View, Text, StyleSheet } from 'react-native'
import { AnimatedButton } from '@/src/components/ui/animated-button'

type AutoGeneratePromptProps = {
  missingCount: number
  onGenerate: () => void
}

export function AutoGeneratePrompt({
  missingCount,
  onGenerate,
}: AutoGeneratePromptProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📅</Text>
      <Text style={styles.title}>Brak planu posiłków</Text>
      <Text style={styles.message}>
        Brakuje {missingCount} {missingCount === 1 ? 'posiłku' : 'posiłków'} w
        Twoim planie.
        {'\n'}
        Wygeneruj automatyczny plan na 7 dni!
      </Text>
      <AnimatedButton
        title='Wygeneruj plan'
        onPress={onGenerate}
        variant='primary'
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5A31F4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
