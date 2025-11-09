/**
 * Recipe Preview Sheet Component
 * Bottom sheet for previewing meal recipe details
 */

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { MEAL_TYPE_CONFIG } from '@/src/types/planned-meal.types'
import type { PlannedMealDTO } from '@/src/types/dto.types'

type RecipePreviewSheetProps = {
  meal: PlannedMealDTO
  visible: boolean
  onClose: () => void
}

export function RecipePreviewSheet({
  meal,
  visible,
  onClose,
}: RecipePreviewSheetProps) {
  const { recipe } = meal
  const mealTypeConfig = MEAL_TYPE_CONFIG[meal.meal_type]

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Image */}
            {recipe.image_url && (
              <Image
                source={{ uri: recipe.image_url }}
                style={styles.headerImage}
                resizeMode='cover'
              />
            )}

            {/* Recipe Info */}
            <View style={styles.content}>
              {/* Title */}
              <View style={styles.titleSection}>
                <Text style={styles.mealType}>
                  {mealTypeConfig.icon} {mealTypeConfig.label}
                </Text>
                <Text style={styles.title}>{recipe.name}</Text>
              </View>

              {/* Nutrition Facts */}
              <View style={styles.nutritionCard}>
                <Text style={styles.sectionTitle}>Wartości odżywcze</Text>
                <View style={styles.nutritionGrid}>
                  <NutritionItem
                    label='Kalorie'
                    value={Math.round(recipe.total_calories || 0)}
                    unit='kcal'
                    icon='flame.fill'
                    color='#EF4444'
                  />
                  <NutritionItem
                    label='Białko'
                    value={Math.round(recipe.total_protein_g || 0)}
                    unit='g'
                    icon='drop.fill'
                    color='#10B981'
                  />
                  <NutritionItem
                    label='Węglowodany'
                    value={Math.round(recipe.total_carbs_g || 0)}
                    unit='g'
                    icon='leaf.fill'
                    color='#F59E0B'
                  />
                  <NutritionItem
                    label='Tłuszcze'
                    value={Math.round(recipe.total_fats_g || 0)}
                    unit='g'
                    icon='scalemass.fill'
                    color='#3B82F6'
                  />
                </View>
              </View>

              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Składniki</Text>
                  <View style={styles.ingredientsList}>
                    {recipe.ingredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <Text style={styles.ingredientBullet}>•</Text>
                        <Text style={styles.ingredientText}>
                          {ingredient.name} - {ingredient.amount}
                          {ingredient.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Instructions */}
              {recipe.instructions && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sposób przygotowania</Text>
                  {typeof recipe.instructions === 'string' ? (
                    <Text style={styles.instructionsText}>
                      {recipe.instructions}
                    </Text>
                  ) : Array.isArray(recipe.instructions) ? (
                    <View style={styles.stepsList}>
                      {recipe.instructions.map((step, index: number) => (
                        <View key={index} style={styles.stepItem}>
                          <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>
                              {step.step}
                            </Text>
                          </View>
                          <Text style={styles.stepText}>
                            {step.description}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              )}

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tagi</Text>
                  <View style={styles.tagsList}>
                    {recipe.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Difficulty & Rating */}
              <View style={styles.footer}>
                {recipe.difficulty_level && (
                  <View style={styles.footerItem}>
                    <IconSymbol
                      name='chart.bar.fill'
                      size={16}
                      color='#6B7280'
                    />
                    <Text style={styles.footerText}>
                      {recipe.difficulty_level === 'easy'
                        ? 'Łatwy'
                        : recipe.difficulty_level === 'medium'
                          ? 'Średni'
                          : 'Trudny'}
                    </Text>
                  </View>
                )}
                {recipe.average_rating && (
                  <View style={styles.footerItem}>
                    <IconSymbol name='star.fill' size={16} color='#F59E0B' />
                    <Text style={styles.footerText}>
                      {recipe.average_rating.toFixed(1)} (
                      {recipe.reviews_count || 0})
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function NutritionItem({
  label,
  value,
  unit,
  icon,
  color,
}: {
  label: string
  value: number
  unit: string
  icon: 'flame.fill' | 'drop.fill' | 'leaf.fill' | 'scalemass.fill'
  color: string
}) {
  return (
    <View style={styles.nutritionItem}>
      <View style={[styles.nutritionIcon, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <Text style={styles.nutritionValue}>
        {value}
        <Text style={styles.nutritionUnit}> {unit}</Text>
      </Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  container: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 20,
  },
  mealType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 32,
  },
  nutritionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  nutritionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  nutritionUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ingredientBullet: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
    marginTop: 2,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5A31F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#5A31F4',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
})
