/**
 * Planned Meal Types
 * Types for meal planning functionality based on web app implementation
 */

import type { RecipeDTO } from './dto.types'

/**
 * Meal type enum - breakfast, lunch, or dinner
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner'

/**
 * Ingredient override for adjusting recipe ingredients
 */
export type IngredientOverride = {
  ingredient_id: number
  new_amount: number
  auto_adjusted?: boolean // true = algorithm, false/undefined = user
}

export type IngredientOverrides = IngredientOverride[]

/**
 * Planned meal DTO from database
 */
export type PlannedMealDTO = {
  id: number
  meal_date: string // YYYY-MM-DD
  meal_type: MealType
  is_eaten: boolean
  ingredient_overrides: IngredientOverrides | null
  recipe: RecipeDTO
  created_at: string
}

/**
 * Replacement recipe DTO - simplified recipe for swap list
 */
export type ReplacementRecipeDTO = {
  id: number
  name: string
  image_url: string | null
  meal_types: MealType[]
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  calorie_diff: number // difference from original recipe
}

/**
 * Day plan view model - single day with 3 meals
 */
export type DayPlanViewModel = {
  date: string // YYYY-MM-DD
  dayName: string // 'Poniedziałek', 'Wtorek', ...
  dayNumber: number // 1-31
  monthName: string // 'Sty', 'Lut', ...
  isToday: boolean
  isPast: boolean
  breakfast: PlannedMealDTO | null
  lunch: PlannedMealDTO | null
  dinner: PlannedMealDTO | null
}

/**
 * Week plan view model - 7 days
 */
export type WeekPlanViewModel = {
  days: DayPlanViewModel[]
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

/**
 * API request types
 */
export type GetPlannedMealsParams = {
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
}

export type UpdatePlannedMealRequest =
  | { action: 'mark_eaten'; is_eaten: boolean }
  | { action: 'swap_recipe'; recipe_id: number }
  | { action: 'modify_ingredients'; ingredient_overrides: IngredientOverrides }

/**
 * API response types
 */
export type GetPlannedMealsResponse = {
  data: PlannedMealDTO[]
}

export type GetReplacementsResponse = {
  data: ReplacementRecipeDTO[]
}

export type UpdatePlannedMealResponse = {
  data: PlannedMealDTO
}

export type GenerateMealPlanResponse = {
  data: {
    generated_count: number
    start_date: string
    end_date: string
  }
}

/**
 * Meal type metadata for UI
 */
export const MEAL_TYPE_CONFIG: Record<
  MealType,
  {
    label: string
    color: string
    icon: string
  }
> = {
  breakfast: {
    label: 'Śniadanie',
    color: '#C8E6C9', // light green
    icon: 'sunrise',
  },
  lunch: {
    label: 'Obiad',
    color: '#FFE082', // light yellow
    icon: 'sun',
  },
  dinner: {
    label: 'Kolacja',
    color: '#FFAB91', // light orange
    icon: 'sunset',
  },
}

/**
 * Polish day names
 */
export const DAY_NAMES = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
]

/**
 * Polish month names (short)
 */
export const MONTH_NAMES_SHORT = [
  'Sty',
  'Lut',
  'Mar',
  'Kwi',
  'Maj',
  'Cze',
  'Lip',
  'Sie',
  'Wrz',
  'Paź',
  'Lis',
  'Gru',
]

/**
 * Polish month names (full)
 */
export const MONTH_NAMES_FULL = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
]
