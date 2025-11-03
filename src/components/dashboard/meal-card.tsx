/**
 * MealCard Component
 *
 * Karta pojedynczego posiłku:
 * - Obraz przepisu
 * - Nazwa + typ posiłku
 * - Makroskładniki (kcal, P, C, F)
 * - Checkbox (is_eaten)
 * - Przyciski akcji (Edit, Swap)
 */

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'
import type { PlannedMealDTO } from '@src/types/dto.types'
import type { Enums } from '@src/types/database.types'

interface MealCardProps {
  meal: PlannedMealDTO
  onToggleEaten: (mealId: number, isEaten: boolean) => void
  onEdit: (mealId: number) => void
  onSwap: (mealId: number) => void
}

/**
 * Mapowanie typu posiłku na emoji i nazwę
 */
const MEAL_TYPE_CONFIG: Record<
  Enums<'meal_type_enum'>,
  { emoji: string; label: string }
> = {
  breakfast: { emoji: '🌅', label: 'Śniadanie' },
  lunch: { emoji: '☀️', label: 'Obiad' },
  dinner: { emoji: '🌙', label: 'Kolacja' },
}

/**
 * Mapowanie poziomu trudności na emoji
 */
const DIFFICULTY_CONFIG: Record<Enums<'difficulty_level_enum'>, string> = {
  easy: '⭐',
  medium: '⭐⭐',
  hard: '⭐⭐⭐',
}

/**
 * Karta pojedynczego posiłku
 */
export function MealCard({
  meal,
  onToggleEaten,
  onEdit,
  onSwap,
}: MealCardProps) {
  const { recipe } = meal
  const mealTypeConfig = MEAL_TYPE_CONFIG[meal.meal_type]

  // Oblicz wartości odżywcze (z uwzględnieniem ingredient_overrides)
  const macros = {
    calories: recipe.total_calories || 0,
    protein: recipe.total_protein_g || 0,
    carbs: recipe.total_carbs_g || 0,
    fats: recipe.total_fats_g || 0,
  }

  return (
    <View style={styles.container}>
      {/* Header z typem posiłku */}
      <View style={styles.header}>
        <View style={styles.mealTypeContainer}>
          <Text style={styles.mealTypeEmoji}>{mealTypeConfig.emoji}</Text>
          <Text style={styles.mealTypeLabel}>{mealTypeConfig.label}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggleEaten(meal.id, !meal.is_eaten)}
        >
          <View
            style={[styles.checkbox, meal.is_eaten && styles.checkboxChecked]}
          >
            {meal.is_eaten && (
              <IconSymbol name='checkmark' size={16} color='#ffffff' />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            {meal.is_eaten ? 'Zjedzone' : 'Oznacz'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content z obrazem i info */}
      <View style={styles.content}>
        {/* Obraz przepisu */}
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <IconSymbol name='fork.knife' size={32} color='#9ca3af' />
          </View>
        )}

        {/* Info o przepisie */}
        <View style={styles.info}>
          <Text style={styles.recipeName} numberOfLines={2}>
            {recipe.name}
          </Text>

          {/* Trudność i rating */}
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              {DIFFICULTY_CONFIG[recipe.difficulty_level]}
            </Text>
            {recipe.average_rating && (
              <Text style={styles.metaText}>
                ⭐ {recipe.average_rating.toFixed(1)}
              </Text>
            )}
          </View>

          {/* Makroskładniki */}
          <View style={styles.macros}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>
                {Math.round(macros.calories)}
              </Text>
              <Text style={styles.macroLabel}>kcal</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>
                {Math.round(macros.protein)}
              </Text>
              <Text style={styles.macroLabel}>B</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{Math.round(macros.carbs)}</Text>
              <Text style={styles.macroLabel}>W</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{Math.round(macros.fats)}</Text>
              <Text style={styles.macroLabel}>T</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer z akcjami */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(meal.id)}
        >
          <IconSymbol name='pencil' size={18} color='#5A31F4' />
          <Text style={styles.actionButtonText}>Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSwap(meal.id)}
        >
          <IconSymbol
            name='arrow.triangle.2.circlepath'
            size={18}
            color='#5A31F4'
          />
          <Text style={styles.actionButtonText}>Zamień</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTypeEmoji: {
    fontSize: 20,
  },
  mealTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 8,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  macros: {
    flexDirection: 'row',
    gap: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  macroLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A31F4',
  },
})
