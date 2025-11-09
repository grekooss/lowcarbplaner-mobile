/**
 * Meal Plan Utilities
 * Helper functions for transforming and managing meal plan data
 */

import type {
  PlannedMealDTO,
  DayPlanViewModel,
  WeekPlanViewModel,
  MealType,
} from '@/src/types/planned-meal.types'
import {
  DAY_NAMES,
  MONTH_NAMES_SHORT,
  MONTH_NAMES_FULL,
} from '@/src/types/planned-meal.types'

/**
 * Get current week date range (today + 6 days)
 */
export function getCurrentWeekRange(): { startDate: string; endDate: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = today.toISOString().split('T')[0] as string

  const end = new Date(today)
  end.setDate(today.getDate() + 6)
  const endDate = end.toISOString().split('T')[0] as string

  return { startDate, endDate }
}

/**
 * Transform planned meals array to week view model
 */
export function transformToWeekViewModel(
  meals: PlannedMealDTO[],
  startDate: string,
  endDate: string
): WeekPlanViewModel {
  const days: DayPlanViewModel[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Create 7 days
  const start = new Date(startDate)
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)

    const dateStr = currentDate.toISOString().split('T')[0] as string
    const dayMeals = meals.filter((m) => m.meal_date === dateStr)

    const dayDate = new Date(dateStr)
    dayDate.setHours(0, 0, 0, 0)

    days.push({
      date: dateStr,
      dayName: DAY_NAMES[currentDate.getDay()] as string,
      dayNumber: currentDate.getDate(),
      monthName: MONTH_NAMES_SHORT[currentDate.getMonth()] as string,
      isToday: dayDate.getTime() === today.getTime(),
      isPast: dayDate.getTime() < today.getTime(),
      breakfast: dayMeals.find((m) => m.meal_type === 'breakfast') || null,
      lunch: dayMeals.find((m) => m.meal_type === 'lunch') || null,
      dinner: dayMeals.find((m) => m.meal_type === 'dinner') || null,
    })
  }

  return {
    days,
    startDate,
    endDate,
  }
}

/**
 * Get month header for week view
 */
export function getMonthHeader(weekPlan: WeekPlanViewModel): {
  primary: string
  secondary: string | null
} {
  if (!weekPlan.days.length) {
    return { primary: '', secondary: null }
  }

  const firstDayDate = weekPlan.days[0]?.date
  const lastDayDate = weekPlan.days[weekPlan.days.length - 1]?.date

  if (!firstDayDate || !lastDayDate) {
    return { primary: '', secondary: null }
  }

  const firstDay = new Date(firstDayDate)
  const lastDay = new Date(lastDayDate)

  const firstMonth = firstDay.getMonth()
  const lastMonth = lastDay.getMonth()

  if (firstMonth === lastMonth) {
    // Same month
    return {
      primary: MONTH_NAMES_FULL[firstMonth] || '',
      secondary: firstDay.getFullYear().toString(),
    }
  } else {
    // Different months
    return {
      primary: `${MONTH_NAMES_FULL[firstMonth]} / ${MONTH_NAMES_FULL[lastMonth]}`,
      secondary: firstDay.getFullYear().toString(),
    }
  }
}

/**
 * Check if meal plan is complete (21 meals)
 */
export function isMealPlanComplete(weekPlan: WeekPlanViewModel): boolean {
  if (!weekPlan.days.length) return false

  let mealCount = 0
  for (const day of weekPlan.days) {
    if (day.breakfast) mealCount++
    if (day.lunch) mealCount++
    if (day.dinner) mealCount++
  }

  return mealCount === 21
}

/**
 * Get missing meals count
 */
export function getMissingMealsCount(weekPlan: WeekPlanViewModel): number {
  let mealCount = 0
  for (const day of weekPlan.days) {
    if (day.breakfast) mealCount++
    if (day.lunch) mealCount++
    if (day.dinner) mealCount++
  }

  return 21 - mealCount
}

/**
 * Calculate total nutrition for a day
 */
export function getDayNutrition(day: DayPlanViewModel) {
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFats = 0

  const meals = [day.breakfast, day.lunch, day.dinner].filter(
    Boolean
  ) as PlannedMealDTO[]

  for (const meal of meals) {
    totalCalories += meal.recipe.total_calories || 0
    totalProtein += meal.recipe.total_protein_g || 0
    totalCarbs += meal.recipe.total_carbs_g || 0
    totalFats += meal.recipe.total_fats_g || 0
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fats: Math.round(totalFats),
  }
}

/**
 * Get meal type label in Polish
 */
export function getMealTypeLabel(mealType: MealType): string {
  const labels: Record<MealType, string> = {
    breakfast: 'Śniadanie',
    lunch: 'Obiad',
    dinner: 'Kolacja',
  }

  return labels[mealType]
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: string): string {
  const d = new Date(date)
  return `${d.getDate()} ${MONTH_NAMES_FULL[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Check if date is today
 */
export function isToday(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)

  return today.getTime() === checkDate.getTime()
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)

  return checkDate.getTime() < today.getTime()
}
