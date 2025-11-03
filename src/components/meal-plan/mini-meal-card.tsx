/**
 * MiniMealCard Component
 *
 * Kompaktowa karta posiłku w widoku tygodniowym:
 * - Miniaturka zdjęcia przepisu
 * - Nazwa przepisu
 * - Typ posiłku (śniadanie/obiad/kolacja)
 * - Wartości makro (kompaktowo)
 * - Status (zjedzony/niezjedzony)
 */

import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import type { PlannedMealDTO } from '@src/types/dto.types'
import { IconSymbol } from '@/components/ui/icon-symbol'

interface MiniMealCardProps {
  meal: PlannedMealDTO
  onPress?: (mealId: number) => void
}

const MEAL_TYPE_CONFIG = {
  breakfast: { emoji: '🌅', label: 'Śniadanie' },
  lunch: { emoji: '☀️', label: 'Obiad' },
  dinner: { emoji: '🌙', label: 'Kolacja' },
} as const

/**
 * Kompaktowa karta posiłku do widoku tygodniowego
 */
export function MiniMealCard({ meal, onPress }: MiniMealCardProps) {
  const { recipe } = meal
  const config = MEAL_TYPE_CONFIG[meal.meal_type]

  const handlePress = () => {
    onPress?.(meal.id)
  }

  return (
    <TouchableOpacity
      style={[styles.container, meal.is_eaten && styles.containerEaten]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel={`${config.label}: ${recipe.name}`}
    >
      {/* Miniaturka przepisu */}
      <View style={styles.imageContainer}>
        {recipe.image_url ? (
          <Image
            source={{ uri: recipe.image_url }}
            style={styles.image}
            resizeMode='cover'
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <IconSymbol name='fork.knife' size={16} color='#9ca3af' />
          </View>
        )}

        {/* Status eaten overlay */}
        {meal.is_eaten && (
          <View style={styles.eatenOverlay}>
            <IconSymbol
              name='checkmark.circle.fill'
              size={20}
              color='#10b981'
            />
          </View>
        )}
      </View>

      {/* Info sekcja */}
      <View style={styles.info}>
        {/* Typ posiłku */}
        <Text style={styles.mealType}>
          {config.emoji} {config.label}
        </Text>

        {/* Nazwa przepisu */}
        <Text
          style={[styles.recipeName, meal.is_eaten && styles.recipeNameEaten]}
          numberOfLines={2}
        >
          {recipe.name}
        </Text>

        {/* Makro - kompaktowy widok */}
        <View style={styles.macros}>
          <MacroChip
            value={Math.round(recipe.total_calories || 0)}
            unit='kcal'
            color='#111827'
          />
          <MacroChip
            value={Math.round(recipe.total_protein_g || 0)}
            unit='B'
            color='#10b981'
          />
          <MacroChip
            value={Math.round(recipe.total_carbs_g || 0)}
            unit='W'
            color='#f59e0b'
          />
          <MacroChip
            value={Math.round(recipe.total_fats_g || 0)}
            unit='T'
            color='#ef4444'
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

/**
 * Małe makro chip
 */
function MacroChip({
  value,
  unit,
  color,
}: {
  value: number
  unit: string
  color: string
}) {
  return (
    <View style={styles.macroChip}>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
      <Text style={styles.macroUnit}>{unit}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  containerEaten: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eatenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mealType: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  recipeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 16,
    marginBottom: 4,
  },
  recipeNameEaten: {
    color: '#6b7280',
  },
  macros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  macroUnit: {
    fontSize: 10,
    color: '#9ca3af',
  },
})
