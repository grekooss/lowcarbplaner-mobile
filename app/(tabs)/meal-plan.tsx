/**
 * Meal Plan Screen
 *
 * Widok tygodniowy planu posiłków:
 * - Nawigacja między tygodniami
 * - 7 dni × 3 posiłki
 * - Podgląd przepisów
 * - Wymiana przepisów
 */

import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { useRouter } from 'expo-router'

// Komponenty Meal Plan
import { WeekHeader } from '@src/components/meal-plan/week-header'
import { DayCard } from '@src/components/meal-plan/day-card'
import { ProtectedScreen } from '@src/components/auth/protected-screen'

// Hooki API
import { usePlannedMealsRange } from '@src/hooks/api/use-planned-meals'
import { useProfile } from '@src/hooks/api/use-profile'
import type { PlannedMealDTO } from '@src/types/dto.types'

export default function MealPlanScreen() {
  const router = useRouter()
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())

  // Oblicz zakres tygodnia (Pon-Niedz)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const startDateStr = format(weekStart, 'yyyy-MM-dd')
  const endDateStr = format(weekEnd, 'yyyy-MM-dd')

  // Queries
  const {
    data: meals,
    isLoading: mealsLoading,
    refetch,
  } = usePlannedMealsRange(startDateStr, endDateStr)
  const { data: profile, isLoading: profileLoading } = useProfile()

  const isLoading = mealsLoading || profileLoading

  const handleRefresh = async () => {
    await refetch()
  }

  const handleWeekChange = (week: Date) => {
    setCurrentWeek(week)
  }

  const handleDayPress = () => {
    // Nawiguj do Dashboard z wybraną datą
    // TODO: Przekazanie daty przez router params
    router.push('/')
  }

  // Pogrupuj posiłki według dat
  const mealsByDate = meals
    ? meals.reduce(
        (acc, meal) => {
          if (!acc[meal.meal_date]) {
            acc[meal.meal_date] = []
          }
          acc[meal.meal_date]!.push(meal)
          return acc
        },
        {} as Record<string, PlannedMealDTO[]>
      )
    : {}

  // Generuj 7 dni tygodnia
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <ProtectedScreen
      placeholder={
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>Plan Tygodniowy</Text>
          <Text style={styles.placeholderMessage}>
            Zaloguj się, aby zobaczyć swój plan posiłków na cały tydzień
          </Text>
        </View>
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Plan Tygodniowy</Text>
          <Text style={styles.headerSubtitle}>
            Zobacz swój plan posiłków na cały tydzień
          </Text>
        </View>

        {/* Week Navigation */}
        <View style={styles.section}>
          <WeekHeader
            currentWeek={currentWeek}
            onWeekChange={handleWeekChange}
          />
        </View>

        {/* Days List */}
        <View style={styles.section}>
          {isLoading ? (
            <ActivityIndicator size='large' color='#5A31F4' />
          ) : (
            weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayMeals = mealsByDate[dateStr] || []

              return (
                <DayCard
                  key={dateStr}
                  date={day}
                  meals={dayMeals}
                  targetCalories={profile?.target_calories || 2000}
                  onDayPress={handleDayPress}
                />
              )
            })
          )}
        </View>
      </ScrollView>
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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
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
})
