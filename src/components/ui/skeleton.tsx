/**
 * Skeleton Component
 *
 * Reusable skeleton loader dla Loading states:
 * - Prosta szara animacja pulsująca
 * - Konfigurowalny width, height, borderRadius
 * - Opcjonalna animacja
 */

import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, ViewStyle } from 'react-native'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: ViewStyle
  animate?: boolean
}

/**
 * Skeleton loader z animacją pulse
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  animate = true,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    if (!animate) return

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )

    animation.start()

    return () => animation.stop()
  }, [animate, opacity])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
          borderRadius,
          opacity: animate ? opacity : 0.3,
        },
        style,
      ]}
    />
  )
}

/**
 * Skeleton dla karty przepisu
 */
export function RecipeCardSkeleton() {
  return (
    <View style={styles.recipeCard}>
      <Skeleton height={180} borderRadius={12} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Skeleton width='40%' height={12} style={styles.recipeCategory} />
        <Skeleton width='90%' height={16} style={styles.recipeName} />
        <Skeleton width='70%' height={16} style={styles.recipeName} />
        <View style={styles.recipeMacros}>
          <Skeleton width={60} height={14} />
          <Skeleton width={60} height={14} />
          <Skeleton width={60} height={14} />
          <Skeleton width={60} height={14} />
        </View>
      </View>
    </View>
  )
}

/**
 * Skeleton dla karty posiłku
 */
export function MealCardSkeleton() {
  return (
    <View style={styles.mealCard}>
      <Skeleton width='30%' height={14} style={styles.mealHeader} />
      <Skeleton height={140} borderRadius={12} style={styles.mealImage} />
      <View style={styles.mealInfo}>
        <Skeleton width='80%' height={16} style={styles.mealName} />
        <View style={styles.mealMacros}>
          <Skeleton width={50} height={12} />
          <Skeleton width={50} height={12} />
          <Skeleton width={50} height={12} />
          <Skeleton width={50} height={12} />
        </View>
      </View>
    </View>
  )
}

/**
 * Skeleton dla DayCard w Meal Plan
 */
export function DayCardSkeleton() {
  return (
    <View style={styles.dayCard}>
      <View style={styles.dayCardHeader}>
        <Skeleton width={80} height={14} />
        <Skeleton width={12} height={12} borderRadius={6} />
      </View>
      <Skeleton width='60%' height={20} style={styles.dayCalories} />
      <Skeleton
        width='100%'
        height={4}
        borderRadius={2}
        style={styles.dayProgress}
      />
      <View style={styles.dayMacros}>
        <Skeleton width={50} height={12} />
        <Skeleton width={50} height={12} />
        <Skeleton width={50} height={12} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  // RecipeCard
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    marginBottom: 0,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeCategory: {
    marginBottom: 8,
  },
  recipeName: {
    marginBottom: 4,
  },
  recipeMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  // MealCard
  mealCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  mealHeader: {
    marginBottom: 8,
  },
  mealImage: {
    marginBottom: 12,
  },
  mealInfo: {
    gap: 8,
  },
  mealName: {
    marginBottom: 8,
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  // DayCard
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayCalories: {
    marginBottom: 8,
  },
  dayProgress: {
    marginBottom: 8,
  },
  dayMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
})
