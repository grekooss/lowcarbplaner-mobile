/**
 * MacroTargetsCard Component
 *
 * Karta wyświetlająca cele makro użytkownika:
 * - Kalorie dzienne
 * - Białko (g)
 * - Węglowodany (g)
 * - Tłuszcze (g)
 * - Przycisk edycji
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'
import type { Tables } from '@src/types/database.types'

interface MacroTargetsCardProps {
  profile: Tables<'profiles'>
  onEdit?: () => void
}

/**
 * Karta z celami makro użytkownika
 */
export function MacroTargetsCard({ profile, onEdit }: MacroTargetsCardProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name='chart.bar.fill' size={24} color='#5A31F4' />
          <Text style={styles.headerTitle}>Cele Makro</Text>
        </View>
        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <IconSymbol name='pencil' size={18} color='#5A31F4' />
          </TouchableOpacity>
        )}
      </View>

      {/* Makro Grid */}
      <View style={styles.grid}>
        <MacroItem
          icon='flame'
          label='Kalorie'
          value={Math.round(profile.target_calories || 0)}
          unit='kcal'
          color='#ef4444'
        />
        <MacroItem
          icon='figure.strengthtraining.traditional'
          label='Białko'
          value={Math.round(profile.target_protein_g || 0)}
          unit='g'
          color='#10b981'
        />
        <MacroItem
          icon='leaf'
          label='Węglowodany'
          value={Math.round(profile.target_carbs_g || 0)}
          unit='g'
          color='#f59e0b'
        />
        <MacroItem
          icon='drop'
          label='Tłuszcze'
          value={Math.round(profile.target_fats_g || 0)}
          unit='g'
          color='#3b82f6'
        />
      </View>
    </View>
  )
}

/**
 * Pojedynczy item makro
 */
function MacroItem({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: string
  label: string
  value: number
  unit: string
  color: string
}) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <IconSymbol name={icon} size={24} color={color} />
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {value} <Text style={styles.macroUnit}>{unit}</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  macroUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#9ca3af',
  },
})
