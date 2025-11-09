/**
 * CalendarStrip Component
 *
 * Stały pasek z datami (7 dni):
 * - 7 dni zaczynając od dzisiaj (dzisiaj + 6 kolejnych dni)
 * - Wszystkie dni widoczne na ekranie (bez przewijania)
 * - Wybór dnia
 * - Oznaczenie dzisiejszego dnia
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { format, addDays, isSameDay, isToday, getMonth } from 'date-fns'
import { pl } from 'date-fns/locale'

// Mapowanie skróconych nazw dni tygodnia
const DAY_NAMES: Record<string, string> = {
  pon: 'Pon',
  wt: 'Wt',
  śr: 'Śr',
  czw: 'Czw',
  pt: 'Pt',
  sob: 'Sob',
  niedz: 'Nie',
}

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
  const dayName = format(date, 'EEEEEE', { locale: pl }).toLowerCase()
  const dayNumber = format(date, 'd')
  const displayDayName = DAY_NAMES[dayName] || dayName

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
        {displayDayName}
      </Text>
      <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
        {dayNumber}
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
  // Generuj 7 dni zaczynając od dzisiaj
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  // Sprawdź, czy dni obejmują różne miesiące
  const firstDay = days[0]!
  const lastDay = days[days.length - 1]!
  const firstMonth = getMonth(firstDay)
  const lastMonth = getMonth(lastDay)

  let monthsHeader = ''
  if (firstMonth === lastMonth) {
    // Jeden miesiąc
    monthsHeader = format(firstDay, 'LLLL', { locale: pl })
  } else {
    // Dwa miesiące
    const firstMonthName = format(firstDay, 'LLLL', { locale: pl })
    const lastMonthName = format(lastDay, 'LLLL', { locale: pl })
    monthsHeader = `${firstMonthName} - ${lastMonthName}`
  }

  return (
    <View style={styles.container}>
      {/* Nagłówek z miesiącem/miesiącami */}
      <Text style={styles.monthsHeader}>{monthsHeader}</Text>

      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <DayItem
            key={index}
            date={day}
            isSelected={isSameDay(day, selectedDate)}
            isToday={isToday(day)}
            onPress={() => onDateSelect(day)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthsHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
  },
  dayItemSelected: {
    backgroundColor: '#5A31F4',
  },
  dayItemToday: {
    borderWidth: 2,
    borderColor: '#5A31F4',
  },
  dayName: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  dayNameSelected: {
    color: '#ffffff',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  dayNumberSelected: {
    color: '#ffffff',
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
