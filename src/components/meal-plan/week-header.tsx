/**
 * WeekHeader Component
 *
 * Nagłówek widoku tygodniowego z nawigacją:
 * - Wyświetlanie aktualnego tygodnia (data początkowa - końcowa)
 * - Przyciski nawigacji (poprzedni/następny tydzień)
 * - Przycisk "Dzisiaj" do powrotu do bieżącego tygodnia
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isThisWeek,
} from 'date-fns'
import { pl } from 'date-fns/locale'
import { IconSymbol } from '@/components/ui/icon-symbol'

interface WeekHeaderProps {
  currentWeek: Date
  onWeekChange: (week: Date) => void
}

/**
 * Nagłówek tygodniowego widoku planu posiłków
 */
export function WeekHeader({ currentWeek, onWeekChange }: WeekHeaderProps) {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Poniedziałek
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }) // Niedziela
  const isCurrentWeek = isThisWeek(currentWeek, { weekStartsOn: 1 })

  // Format wyświetlania zakresu dat
  const weekRange = `${format(weekStart, 'd MMM', { locale: pl })} - ${format(weekEnd, 'd MMM yyyy', { locale: pl })}`

  const handlePreviousWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1))
  }

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1))
  }

  const handleToday = () => {
    onWeekChange(new Date())
  }

  return (
    <View style={styles.container}>
      {/* Nawigacja tydzień w tył */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={handlePreviousWeek}
        accessibilityLabel='Poprzedni tydzień'
      >
        <IconSymbol name='chevron.left' size={24} color='#5A31F4' />
      </TouchableOpacity>

      {/* Wyświetlanie zakresu tygodnia */}
      <View style={styles.weekInfo}>
        <Text style={styles.weekRange}>{weekRange}</Text>

        {/* Przycisk "Dzisiaj" - pokazuj tylko gdy nie jesteśmy w bieżącym tygodniu */}
        {!isCurrentWeek && (
          <TouchableOpacity
            style={styles.todayButton}
            onPress={handleToday}
            accessibilityLabel='Wróć do dzisiejszego tygodnia'
          >
            <Text style={styles.todayText}>Dzisiaj</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nawigacja tydzień do przodu */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={handleNextWeek}
        accessibilityLabel='Następny tydzień'
      >
        <IconSymbol name='chevron.right' size={24} color='#5A31F4' />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  weekInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  weekRange: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#5A31F4',
  },
  todayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
})
