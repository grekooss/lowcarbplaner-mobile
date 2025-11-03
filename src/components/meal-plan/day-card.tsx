/**
 * DayCard Component
 *
 * Karta pojedynczego dnia w widoku tygodniowym:
 * - Wyświetlanie daty i dnia tygodnia
 * - Podsumowanie makro (consumed/target)
 * - Lista mini meal cards (kompaktowy widok posiłków)
 * - Status dnia (czy wszystkie posiłki zjedzone)
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { format, isToday } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { PlannedMealDTO } from '@src/types/dto.types'

interface DayCardProps {
  date: Date
  meals: PlannedMealDTO[]
  targetCalories: number
  onDayPress?: (date: Date) => void
}

/**
 * Karta pojedynczego dnia w tygodniowym planie
 */
export function DayCard({
  date,
  meals,
  targetCalories,
  onDayPress,
}: DayCardProps) {
  const isTodayFlag = isToday(date)
  const dayName = format(date, 'EEEE', { locale: pl })
  const dayNumber = format(date, 'd')
  const monthName = format(date, 'MMM', { locale: pl })

  // Oblicz consumed macros
  const consumed = {
    calories: meals.reduce((sum, m) => sum + (m.recipe.total_calories || 0), 0),
    protein: meals.reduce((sum, m) => sum + (m.recipe.total_protein_g || 0), 0),
    carbs: meals.reduce((sum, m) => sum + (m.recipe.total_carbs_g || 0), 0),
    fats: meals.reduce((sum, m) => sum + (m.recipe.total_fats_g || 0), 0),
  }

  // Sprawdź status dnia
  const allMealsEaten = meals.length > 0 && meals.every((m) => m.is_eaten)
  const someMealsEaten = meals.some((m) => m.is_eaten)
  const calorieProgress =
    targetCalories > 0 ? (consumed.calories / targetCalories) * 100 : 0

  const handlePress = () => {
    onDayPress?.(date)
  }

  return (
    <TouchableOpacity
      style={[styles.container, isTodayFlag && styles.containerToday]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel={`${dayName} ${dayNumber} ${monthName}`}
    >
      {/* Header - data i status */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.dayName, isTodayFlag && styles.dayNameToday]}>
            {dayName}
          </Text>
          <Text style={[styles.date, isTodayFlag && styles.dateToday]}>
            {dayNumber} {monthName}
          </Text>
        </View>

        {/* Status indicator */}
        {meals.length > 0 && (
          <View
            style={[
              styles.statusDot,
              allMealsEaten && styles.statusDotComplete,
              someMealsEaten && !allMealsEaten && styles.statusDotPartial,
            ]}
          />
        )}
      </View>

      {/* Podsumowanie kalorii */}
      {meals.length > 0 ? (
        <View style={styles.caloriesSection}>
          <Text style={styles.caloriesValue}>
            {Math.round(consumed.calories)}
            <Text style={styles.caloriesTarget}>
              {' '}
              / {Math.round(targetCalories)}
            </Text>
          </Text>
          <Text style={styles.caloriesLabel}>kcal</Text>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(calorieProgress, 100)}%`,
                  backgroundColor:
                    calorieProgress > 110
                      ? '#ef4444'
                      : calorieProgress > 90
                        ? '#10b981'
                        : '#6b7280',
                },
              ]}
            />
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Brak posiłków</Text>
        </View>
      )}

      {/* Mini podsumowanie makro */}
      {meals.length > 0 && (
        <View style={styles.macrosRow}>
          <MacroItem
            value={Math.round(consumed.protein)}
            label='B'
            color='#10b981'
          />
          <MacroItem
            value={Math.round(consumed.carbs)}
            label='W'
            color='#f59e0b'
          />
          <MacroItem
            value={Math.round(consumed.fats)}
            label='T'
            color='#ef4444'
          />
        </View>
      )}
    </TouchableOpacity>
  )
}

/**
 * Mini makro item (kompaktowy)
 */
function MacroItem({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: string
}) {
  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, { color }]}>{value}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  containerToday: {
    borderColor: '#5A31F4',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  dayNameToday: {
    color: '#5A31F4',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  dateToday: {
    color: '#5A31F4',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  statusDotPartial: {
    backgroundColor: '#f59e0b',
  },
  statusDotComplete: {
    backgroundColor: '#10b981',
  },
  caloriesSection: {
    marginBottom: 12,
  },
  caloriesValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  caloriesTarget: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6b7280',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
})
