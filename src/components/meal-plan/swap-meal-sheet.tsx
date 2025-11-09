/**
 * Swap Meal Sheet Component
 * Bottom sheet for swapping meal recipe with replacements
 */

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'
import {
  useMealReplacements,
  useSwapMeal,
} from '@/src/hooks/api/use-planned-meals'
import { MEAL_TYPE_CONFIG } from '@/src/types/planned-meal.types'
import type { PlannedMealDTO } from '@/src/types/dto.types'

type SwapMealSheetProps = {
  meal: PlannedMealDTO
  visible: boolean
  onClose: () => void
}

export function SwapMealSheet({ meal, visible, onClose }: SwapMealSheetProps) {
  const { data: replacements, isLoading } = useMealReplacements(
    meal?.id || null
  )
  const swapMutation = useSwapMeal()

  const mealTypeConfig = MEAL_TYPE_CONFIG[meal.meal_type]

  const handleSwap = async (newRecipeId: number) => {
    try {
      await swapMutation.mutateAsync({
        mealId: meal.id,
        newRecipeId,
      })
      onClose()
    } catch (error) {
      // Error is handled by the mutation
      console.error('Swap failed:', error)
    }
  }

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
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                Zamień {mealTypeConfig.label.toLowerCase()}
              </Text>
              <Text style={styles.subtitle}>
                Wybierz zamiennik o podobnej kaloryczności (±15%)
              </Text>
            </View>

            {/* Current Meal */}
            <View style={styles.currentMeal}>
              <Text style={styles.currentLabel}>Aktualny przepis:</Text>
              <View style={styles.currentCard}>
                {meal.recipe.image_url && (
                  <Image
                    source={{ uri: meal.recipe.image_url }}
                    style={styles.currentImage}
                    resizeMode='cover'
                  />
                )}
                <View style={styles.currentInfo}>
                  <Text style={styles.currentName} numberOfLines={2}>
                    {meal.recipe.name}
                  </Text>
                  <Text style={styles.currentCalories}>
                    {Math.round(meal.recipe.total_calories || 0)} kcal
                  </Text>
                </View>
              </View>
            </View>

            {/* Replacements List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color='#5A31F4' />
                <Text style={styles.loadingText}>Szukam zamienników...</Text>
              </View>
            ) : replacements && replacements.length > 0 ? (
              <FlatList
                data={replacements}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.replacementCard}
                    onPress={() => handleSwap(item.id)}
                    disabled={swapMutation.isPending}
                  >
                    {item.image_url && (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.replacementImage}
                        resizeMode='cover'
                      />
                    )}
                    <View style={styles.replacementInfo}>
                      <Text style={styles.replacementName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <View style={styles.replacementMacros}>
                        <Text style={styles.replacementCalories}>
                          {Math.round(item.total_calories || 0)} kcal
                        </Text>
                        <Text
                          style={[
                            styles.replacementDiff,
                            item.calorie_diff > 0
                              ? styles.diffPositive
                              : styles.diffNegative,
                          ]}
                        >
                          {item.calorie_diff > 0 ? '+' : ''}
                          {Math.round(item.calorie_diff)}
                        </Text>
                      </View>
                      <View style={styles.replacementMacros}>
                        <Text style={styles.macroText}>
                          B: {Math.round(item.total_protein_g || 0)}g
                        </Text>
                        <Text style={styles.macroText}>
                          W: {Math.round(item.total_carbs_g || 0)}g
                        </Text>
                        <Text style={styles.macroText}>
                          T: {Math.round(item.total_fats_g || 0)}g
                        </Text>
                      </View>
                    </View>
                    <IconSymbol
                      name='chevron.right'
                      size={20}
                      color='#9CA3AF'
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <IconSymbol name='magnifyingglass' size={48} color='#9CA3AF' />
                <Text style={styles.emptyTitle}>Brak zamienników</Text>
                <Text style={styles.emptyMessage}>
                  Nie znaleźliśmy przepisów o podobnej kaloryczności dla tego
                  typu posiłku.
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
    maxHeight: '80%',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  currentMeal: {
    marginBottom: 20,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  currentCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  currentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  currentInfo: {
    flex: 1,
  },
  currentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  currentCalories: {
    fontSize: 13,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 20,
  },
  replacementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  replacementImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  replacementInfo: {
    flex: 1,
  },
  replacementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  replacementMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  replacementCalories: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  replacementDiff: {
    fontSize: 12,
    fontWeight: '600',
  },
  diffPositive: {
    color: '#EF4444',
  },
  diffNegative: {
    color: '#10B981',
  },
  macroText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
})
