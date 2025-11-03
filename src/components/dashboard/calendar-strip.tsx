/**
 * CalendarStrip Component
 *
 * Horizontal scroll z datami (7 dni):
 * - Wybór dnia
 * - Oznaczenie dzisiejszego dnia
 * - Smooth scroll do wybranego dnia
 */

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { format, addDays, isSameDay, isToday } from 'date-fns'
import { pl } from 'date-fns/locale'

interface CalendarStripProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

/**
 * Pojedynczy dzień w kalendarzu
 */
function DayItem({
  date,
  isSelected,
  isToday: isTodayFlag,
  onPress,
}: {
  date: Date
  isSelected: boolean
  isToday: boolean
  onPress: () => void
}) {
  const dayName = format(date, 'EEE', { locale: pl })
  const dayNumber = format(date, 'd')
  const monthName = format(date, 'MMM', { locale: pl })

  return (
    <TouchableOpacity
      style={[
        styles.dayItem,
        isSelected && styles.dayItemSelected,
        isTodayFlag && !isSelected && styles.dayItemToday,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
        {dayName}
      </Text>
      <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
        {dayNumber}
      </Text>
      <Text style={[styles.monthName, isSelected && styles.monthNameSelected]}>
        {monthName}
      </Text>
      {isTodayFlag && !isSelected && <View style={styles.todayIndicator} />}
    </TouchableOpacity>
  )
}

/**
 * Pasek kalendarza z 7 dniami
 */
export function CalendarStrip({
  selectedDate,
  onDateSelect,
}: CalendarStripProps) {
  // Generuj 7 dni (dzisiaj ± 3 dni)
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 3))

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((day, index) => (
          <DayItem
            key={index}
            date={day}
            isSelected={isSameDay(day, selectedDate)}
            isToday={isToday(day)}
            onPress={() => onDateSelect(day)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    minWidth: 70,
  },
  dayItemSelected: {
    backgroundColor: '#5A31F4',
  },
  dayItemToday: {
    borderWidth: 2,
    borderColor: '#5A31F4',
  },
  dayName: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dayNameSelected: {
    color: '#ffffff',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  dayNumberSelected: {
    color: '#ffffff',
  },
  monthName: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  monthNameSelected: {
    color: '#e9d5ff',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5A31F4',
  },
})
