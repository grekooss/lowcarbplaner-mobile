/**
 * Nutrition Calculator - BMR, TDEE, and Macro Goals
 * Based on Mifflin-St Jeor equation
 */

type Gender = 'male' | 'female'
type ActivityLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
type Goal = 'weight_loss' | 'weight_maintenance'

interface UserData {
  gender: Gender
  age: number
  weight_kg: number
  height_cm: number
  activity_level: ActivityLevel
  goal: Goal
  weight_loss_rate_kg_week?: number
}

interface NutritionGoals {
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
}

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  very_low: 1.2, // Sedentary (little or no exercise)
  low: 1.375, // Lightly active (light exercise 1-3 days/week)
  moderate: 1.55, // Moderately active (moderate exercise 3-5 days/week)
  high: 1.725, // Very active (hard exercise 6-7 days/week)
  very_high: 1.9, // Extremely active (very hard exercise, physical job)
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
 * BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(years) + s
 * where s = +5 for males, −161 for females
 */
function calculateBMR(data: UserData): number {
  const { gender, age, weight_kg, height_cm } = data

  const baseBMR = 10 * weight_kg + 6.25 * height_cm - 5 * age
  const genderModifier = gender === 'male' ? 5 : -161

  return Math.round(baseBMR + genderModifier)
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
function calculateTDEE(data: UserData): number {
  const bmr = calculateBMR(data)
  const activityMultiplier = ACTIVITY_MULTIPLIERS[data.activity_level]

  return Math.round(bmr * activityMultiplier)
}

/**
 * Calculate target calories based on goal
 * Weight loss: TDEE - (weight_loss_rate_kg_week × 7700 / 7)
 * Weight maintenance: TDEE
 *
 * Note: 1 kg fat ≈ 7700 kcal, so daily deficit = (kg_per_week × 7700) / 7
 */
function calculateTargetCalories(data: UserData): number {
  const tdee = calculateTDEE(data)

  if (data.goal === 'weight_loss') {
    const weightLossRate = data.weight_loss_rate_kg_week || 0.5 // Default 0.5 kg/week
    const dailyDeficit = Math.round((weightLossRate * 7700) / 7)
    return Math.max(1200, tdee - dailyDeficit) // Minimum 1200 kcal for safety
  }

  return tdee
}

/**
 * Calculate macro goals for low-carb diet
 * Distribution:
 * - Carbs: 15% of calories
 * - Protein: 35% of calories
 * - Fats: 50% of calories
 *
 * Conversion:
 * - 1g carbs = 4 kcal
 * - 1g protein = 4 kcal
 * - 1g fat = 9 kcal
 */
export function calculateNutritionGoals(data: UserData): NutritionGoals {
  const targetCalories = calculateTargetCalories(data)

  // Calculate macros based on percentage distribution
  const carbsCalories = targetCalories * 0.15
  const proteinCalories = targetCalories * 0.35
  const fatsCalories = targetCalories * 0.5

  // Convert calories to grams
  const targetCarbsG = Math.round(carbsCalories / 4)
  const targetProteinG = Math.round(proteinCalories / 4)
  const targetFatsG = Math.round(fatsCalories / 9)

  return {
    target_calories: targetCalories,
    target_carbs_g: targetCarbsG,
    target_protein_g: targetProteinG,
    target_fats_g: targetFatsG,
  }
}

/**
 * Example usage:
 *
 * const userData = {
 *   gender: 'male',
 *   age: 35,
 *   weight_kg: 85,
 *   height_cm: 180,
 *   activity_level: 'moderate',
 *   goal: 'weight_loss',
 *   weight_loss_rate_kg_week: 0.5
 * };
 *
 * const goals = calculateNutritionGoals(userData);
 * // {
 * //   target_calories: 2200,
 * //   target_carbs_g: 82,
 * //   target_protein_g: 192,
 * //   target_fats_g: 122
 * // }
 */
