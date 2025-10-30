/**
 * Onboarding Step 2
 *
 * Aktywność fizyczna i cel
 */

import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'

type ActivityLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
type Goal = 'weight_loss' | 'weight_maintenance'

const ACTIVITY_LEVELS: {
  value: ActivityLevel
  label: string
  description: string
}[] = [
  {
    value: 'very_low',
    label: 'Bardzo niska',
    description: 'Praca siedząca, brak aktywności fizycznej',
  },
  {
    value: 'low',
    label: 'Niska',
    description: 'Lekka aktywność 1-3 razy w tygodniu',
  },
  {
    value: 'moderate',
    label: 'Umiarkowana',
    description: 'Umiarkowana aktywność 3-5 razy w tygodniu',
  },
  {
    value: 'high',
    label: 'Wysoka',
    description: 'Intensywna aktywność 6-7 razy w tygodniu',
  },
  {
    value: 'very_high',
    label: 'Bardzo wysoka',
    description: 'Bardzo intensywna aktywność, praca fizyczna',
  },
]

const GOALS: { value: Goal; label: string; description: string }[] = [
  {
    value: 'weight_loss',
    label: 'Utrata wagi',
    description: 'Chcę schudnąć i obniżyć wagę ciała',
  },
  {
    value: 'weight_maintenance',
    label: 'Utrzymanie wagi',
    description: 'Chcę utrzymać obecną wagę',
  },
]

export default function OnboardingStep2() {
  const router = useRouter()

  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)

  const isValid = activityLevel && goal

  const handleContinue = () => {
    if (!isValid) return

    // TODO: Zapisać dane i wysłać do API
    router.replace('/(app)')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.content}>
          {/* Progress */}
          <View style={styles.progress}>
            <View style={[styles.progressBar, { width: '66%' }]} />
          </View>
          <Text style={styles.progressText}>Krok 2 z 3</Text>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Aktywność i cel</Text>
            <Text style={styles.subtitle}>
              Określ swój poziom aktywności i cel żywieniowy
            </Text>
          </View>

          {/* Activity Level */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Poziom aktywności fizycznej</Text>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.optionCard,
                  activityLevel === level.value && styles.optionCardActive,
                ]}
                onPress={() => setActivityLevel(level.value)}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      activityLevel === level.value && styles.optionLabelActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {level.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Goal */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Twój cel</Text>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.optionCard,
                  goal === g.value && styles.optionCardActive,
                ]}
                onPress={() => setGoal(g.value)}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      goal === g.value && styles.optionLabelActive,
                    ]}
                  >
                    {g.label}
                  </Text>
                  <Text style={styles.optionDescription}>{g.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Wstecz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>Zakończ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  progress: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5A31F4',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionCardActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#5A31F4',
  },
  optionContent: {
    gap: 4,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  optionLabelActive: {
    color: '#5A31F4',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 2,
    backgroundColor: '#5A31F4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
