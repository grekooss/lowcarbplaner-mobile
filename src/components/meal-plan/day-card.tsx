/**
 * DayCard Component
 *
 * Karta pojedynczego dnia w widoku tygodniowym:
 * - Wyświetlanie daty i dnia tygodnia
 * - Lista 3 posiłków (śniadanie, obiad, kolacja)
 * - Możliwość wymiany przepisów
 * - Badge "Dziś" dla bieżącego dnia
 */

import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { DayPlanViewModel } from '@/src/types/planned-meal.types'
import { MiniMealCard } from './mini-meal-card'
import { SwapMealSheet } from './swap-meal-sheet'
import { RecipePreviewSheet } from './recipe-preview-sheet'
import type { PlannedMealDTO } from '@src/types/dto.types'

interface DayCardProps {
  day: DayPlanViewModel
  onDayPress?: (date: string) => void
}

/**
 * Karta pojedynczego dnia w tygodniowym planie
 */
export function DayCard({ day }: DayCardProps) {
  const [selectedMeal, setSelectedMeal] = useState<PlannedMealDTO | null>(null)
  const [swapMeal, setSwapMeal] = useState<PlannedMealDTO | null>(null)

  const handleMealPress = (meal: PlannedMealDTO) => {
    setSelectedMeal(meal)
  }

  const handleSwapPress = (meal: PlannedMealDTO) => {
    setSwapMeal(meal)
  }

  const meals = [day.breakfast, day.lunch, day.dinner].filter(
    Boolean
  ) as PlannedMealDTO[]
  const hasMeals = meals.length > 0

  return (
    <>
      <View style={[styles.container, day.isToday && styles.containerToday]}>
        {/* Header - data i badge */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.dayName, day.isToday && styles.dayNameToday]}>
              {day.dayName}
            </Text>
            <Text style={[styles.date, day.isToday && styles.dateToday]}>
              {day.dayNumber}
            </Text>
          </View>

          {/* Badge "Dziś" */}
          {day.isToday && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Dziś</Text>
            </View>
          )}
        </View>

        {/* Meals */}
        {hasMeals ? (
          <View style={styles.mealsContainer}>
            {day.breakfast && (
              <MiniMealCard
                meal={day.breakfast}
                onPress={() => handleMealPress(day.breakfast!)}
                onSwapPress={() => handleSwapPress(day.breakfast!)}
                canSwap={!day.isPast}
              />
            )}
            {day.lunch && (
              <MiniMealCard
                meal={day.lunch}
                onPress={() => handleMealPress(day.lunch!)}
                onSwapPress={() => handleSwapPress(day.lunch!)}
                canSwap={!day.isPast}
              />
            )}
            {day.dinner && (
              <MiniMealCard
                meal={day.dinner}
                onPress={() => handleMealPress(day.dinner!)}
                onSwapPress={() => handleSwapPress(day.dinner!)}
                canSwap={!day.isPast}
              />
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Brak posiłków</Text>
          </View>
        )}
      </View>

      {/* Recipe Preview Sheet */}
      {selectedMeal && (
        <RecipePreviewSheet
          meal={selectedMeal}
          visible={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      {/* Swap Meal Sheet */}
      {swapMeal && (
        <SwapMealSheet
          meal={swapMeal}
          visible={!!swapMeal}
          onClose={() => setSwapMeal(null)}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5EFE7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  containerToday: {
    borderColor: '#5A31F4',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  dayNameToday: {
    color: '#5A31F4',
  },
  date: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateToday: {
    color: '#5A31F4',
  },
  todayBadge: {
    backgroundColor: '#5A31F4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mealsContainer: {
    gap: 12,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
})
