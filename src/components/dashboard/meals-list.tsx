/**
 * MealsList Component
 *
 * Lista posiłków na dany dzień (3 posiłki: śniadanie, obiad, kolacja)
 * - Wyświetla MealCard dla każdego posiłku
 * - Obsługuje akcje (toggle eaten, edit, swap)
 */

import { View, StyleSheet } from 'react-native'
import { MealCard } from './meal-card'
import type { PlannedMealDTO } from '@src/types/dto.types'

interface MealsListProps {
  meals: PlannedMealDTO[]
  onToggleEaten: (mealId: number, isEaten: boolean) => void
  onEdit: (mealId: number) => void
  onSwap: (mealId: number) => void
}

/**
 * Lista wszystkich posiłków na dzień
 */
export function MealsList({
  meals,
  onToggleEaten,
  onEdit,
  onSwap,
}: MealsListProps) {
  return (
    <View style={styles.container}>
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          onToggleEaten={onToggleEaten}
          onEdit={onEdit}
          onSwap={onSwap}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 0, // MealCard ma już marginBottom: 16
  },
})
