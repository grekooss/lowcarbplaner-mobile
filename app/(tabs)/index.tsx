/**
 * Dashboard Screen
 *
 * Główny ekran aplikacji z widokiem dziennym:
 * - Calendar Strip (wybór dnia)
 * - Macro Progress (paski postępu makro)
 * - Meals List (lista 3 posiłków)
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
import { SafeAreaView } from 'react-native-safe-area-context'
import { format, startOfToday } from 'date-fns'

// Komponenty Dashboard
import { CalendarStrip } from '@src/components/dashboard/calendar-strip'
import { MacroProgressCard } from '@src/components/dashboard/macro-progress-card'
import { MealsList } from '@src/components/dashboard/meals-list'
import { EmptyState } from '@src/components/dashboard/empty-state'
import { ProtectedScreen } from '@src/components/auth/protected-screen'

// Hooki API
import {
  usePlannedMeals,
  useToggleMealEaten,
} from '@src/hooks/api/use-planned-meals'
import { useProfile, useGeneratePlan } from '@src/hooks/api/use-profile'

export default function DashboardScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  // Queries
  const {
    data: meals,
    isLoading: mealsLoading,
    refetch,
  } = usePlannedMeals(dateStr)
  const { data: profile, isLoading: profileLoading } = useProfile()

  // Mutations
  const toggleMealEaten = useToggleMealEaten()
  const generatePlan = useGeneratePlan()

  const isLoading = mealsLoading || profileLoading

  const handleRefresh = async () => {
    await refetch()
  }

  const handleToggleEaten = (mealId: number, isEaten: boolean) => {
    toggleMealEaten.mutate({ mealId, isEaten })
  }

  const handleEdit = (mealId: number) => {
    // TODO: Otwórz modal edycji składników
    console.log('Edit meal:', mealId)
  }

  const handleSwap = (mealId: number) => {
    // TODO: Otwórz modal zamiany przepisu
    console.log('Swap meal:', mealId)
  }

  const handleGeneratePlan = () => {
    generatePlan.mutate()
  }

  // Oblicz consumed macros z posiłków
  const consumed = {
    calories:
      meals?.reduce((sum, m) => sum + (m.recipe.total_calories || 0), 0) || 0,
    protein_g:
      meals?.reduce((sum, m) => sum + (m.recipe.total_protein_g || 0), 0) || 0,
    carbs_g:
      meals?.reduce((sum, m) => sum + (m.recipe.total_carbs_g || 0), 0) || 0,
    fats_g:
      meals?.reduce((sum, m) => sum + (m.recipe.total_fats_g || 0), 0) || 0,
  }

  return (
    <ProtectedScreen
      placeholder={
        <SafeAreaView
          style={styles.container}
          edges={['left', 'right', 'bottom']}
        >
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>Dashboard</Text>
            <Text style={styles.placeholderMessage}>
              Zaloguj się, aby zobaczyć swoje posiłki i makroskładniki
            </Text>
          </View>
        </SafeAreaView>
      }
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
        >
          {/* Calendar Strip - wybór dnia */}
          <View style={styles.section}>
            <CalendarStrip
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </View>

          {/* Macro Progress - paski postępu makro */}
          {profile && (
            <View style={styles.section}>
              <MacroProgressCard consumed={consumed} target={profile} />
            </View>
          )}

          {/* Meals List - lista posiłków */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ Posiłki</Text>
            {isLoading ? (
              <ActivityIndicator size='large' color='#5A31F4' />
            ) : meals && meals.length > 0 ? (
              <MealsList
                meals={meals}
                onToggleEaten={handleToggleEaten}
                onEdit={handleEdit}
                onSwap={handleSwap}
              />
            ) : (
              <EmptyState
                onGenerate={handleGeneratePlan}
                isGenerating={generatePlan.isPending}
              />
            )}
          </View>
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
    paddingBottom: 150, // Tab bar (70px) + Ad (60px) + extra spacing
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  placeholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholderDetail: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
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
})
