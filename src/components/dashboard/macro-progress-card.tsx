/**
 * MacroProgressCard Component
 *
 * Wyświetla paski postępu dla makroskładników:
 * - Kalorie (okrągły progress)
 * - Białko (linear progress)
 * - Węglowodany (linear progress)
 * - Tłuszcze (linear progress)
 */

import { View, Text, StyleSheet } from 'react-native'
import type { Tables } from '@src/types/database.types'

interface MacroProgressCardProps {
  consumed: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
  target: Tables<'profiles'>
}

/**
 * Pojedynczy pasek postępu dla makroskładnika
 */
function MacroProgressBar({
  label,
  consumed,
  target,
  unit,
  color,
}: {
  label: string
  consumed: number
  target: number
  unit: string
  color: string
}) {
  const percentage = Math.min((consumed / target) * 100, 100)
  const isOverTarget = consumed > target

  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={[styles.macroValue, isOverTarget && styles.overTarget]}>
          {Math.round(consumed)} / {Math.round(target)} {unit}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${percentage}%`, backgroundColor: color },
            isOverTarget && styles.progressBarOver,
          ]}
        />
      </View>
      <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
    </View>
  )
}

/**
 * Główny komponent z paskami postępu
 */
export function MacroProgressCard({
  consumed,
  target,
}: MacroProgressCardProps) {
  return (
    <View style={styles.container}>
      {/* Kalorie - najbardziej widoczne */}
      <View style={styles.caloriesSection}>
        <Text style={styles.caloriesLabel}>Kalorie</Text>
        <Text style={styles.caloriesValue}>
          {Math.round(consumed.calories)}
          <Text style={styles.caloriesTarget}>
            {' '}
            / {Math.round(target.target_calories)}
          </Text>
        </Text>
        <Text style={styles.caloriesUnit}>kcal</Text>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Makroskładniki */}
      <View style={styles.macrosSection}>
        <MacroProgressBar
          label='Białko'
          consumed={consumed.protein_g}
          target={target.target_protein_g}
          unit='g'
          color='#10b981'
        />
        <MacroProgressBar
          label='Węglowodany'
          consumed={consumed.carbs_g}
          target={target.target_carbs_g}
          unit='g'
          color='#f59e0b'
        />
        <MacroProgressBar
          label='Tłuszcze'
          consumed={consumed.fats_g}
          target={target.target_fats_g}
          unit='g'
          color='#ef4444'
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caloriesSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5A31F4',
  },
  caloriesTarget: {
    fontSize: 24,
    color: '#9ca3af',
  },
  caloriesUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  macrosSection: {
    gap: 16,
  },
  macroRow: {
    gap: 8,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  macroValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  overTarget: {
    color: '#ef4444',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarOver: {
    backgroundColor: '#ef4444',
  },
  percentage: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
})
