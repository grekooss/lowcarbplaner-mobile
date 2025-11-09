/**
 * Meal Plan Screen
 *
 * Widok tygodniowy planu posiłków:
 * - Automatyczne generowanie planu (7 dni × 3 posiłki)
 * - Wyświetlanie tygodniowego planu
 * - Wymiana przepisów
 * - Podgląd przepisów
 */

import { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

// Komponenty Meal Plan
import { DayCard } from '@src/components/meal-plan/day-card'
import { ProtectedScreen } from '@src/components/auth/protected-screen'
import { AutoGeneratePrompt } from '@src/components/meal-plan/auto-generate-prompt'

// Hooki API
import {
  usePlannedMealsRange,
  useGenerateMealPlan,
} from '@src/hooks/api/use-planned-meals'
import { useProfile } from '@src/hooks/api/use-profile'

// Utils
import {
  getCurrentWeekRange,
  transformToWeekViewModel,
  isMealPlanComplete,
  getMissingMealsCount,
} from '@src/utils/meal-plan-utils'

export default function MealPlanScreen() {
  const router = useRouter()

  // Get current week range (today + 6 days)
  const { startDate, endDate } = getCurrentWeekRange()

  // Queries
  const {
    data: meals,
    isLoading: mealsLoading,
    refetch,
  } = usePlannedMealsRange(startDate, endDate)
  const { isLoading: profileLoading } = useProfile()

  // Mutations
  const generatePlanMutation = useGenerateMealPlan()

  const isLoading = mealsLoading || profileLoading
  const isGenerating = generatePlanMutation.isPending

  // Transform meals to week view model
  const weekPlan =
    meals && !mealsLoading
      ? transformToWeekViewModel(meals, startDate, endDate)
      : null

  // Check if plan needs generation
  const needsGeneration = weekPlan && !isMealPlanComplete(weekPlan)
  const missingCount = weekPlan ? getMissingMealsCount(weekPlan) : 0

  // Auto-generate plan if missing meals
  useEffect(() => {
    if (needsGeneration && !isGenerating && !generatePlanMutation.isSuccess) {
      // Auto-generate only once
      // User can manually trigger if needed
    }
  }, [needsGeneration, isGenerating])

  const handleRefresh = async () => {
    await refetch()
  }

  const handleGeneratePlan = () => {
    generatePlanMutation.mutate()
  }

  const handleDayPress = (_date: string) => {
    // Navigate to dashboard with selected date
    // TODO: Przekazanie daty przez router params
    router.push('/')
  }

  return (
    <ProtectedScreen
      placeholder={
        <SafeAreaView
          style={styles.container}
          edges={['left', 'right', 'bottom']}
        >
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>Plan Posiłków</Text>
            <Text style={styles.placeholderMessage}>
              Zaloguj się, aby zobaczyć swój 7-dniowy plan posiłków
            </Text>
          </View>
        </SafeAreaView>
      }
    >
      <SafeAreaView
        style={styles.container}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        >
          {/* Auto-Generate Prompt */}
          {needsGeneration && !isGenerating && (
            <View style={styles.section}>
              <AutoGeneratePrompt
                missingCount={missingCount}
                onGenerate={handleGeneratePlan}
              />
            </View>
          )}

          {/* Generating Indicator */}
          {isGenerating && (
            <View style={styles.section}>
              <View style={styles.generatingCard}>
                <ActivityIndicator size='large' color='#5A31F4' />
                <Text style={styles.generatingTitle}>
                  Generowanie planu posiłków...
                </Text>
                <Text style={styles.generatingMessage}>
                  Tworzę dla Ciebie spersonalizowany plan na 7 dni. To może
                  chwilę potrwać.
                </Text>
              </View>
            </View>
          )}

          {/* Days List */}
          {!isLoading && weekPlan && (
            <View style={styles.section}>
              {weekPlan.days.map((day) => (
                <DayCard key={day.date} day={day} onDayPress={handleDayPress} />
              ))}
            </View>
          )}

          {/* Loading State */}
          {isLoading && !weekPlan && (
            <View style={styles.section}>
              <ActivityIndicator size='large' color='#5A31F4' />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ProtectedScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  placeholderMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  generatingCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  generatingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  generatingMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
})
