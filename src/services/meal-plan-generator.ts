/**
 * Service Layer - Meal Plan Generator (Mobile)
 *
 * Implementuje logikę biznesową dla automatycznego generowania 7-dniowego
 * planu posiłków zgodnego z celami żywieniowymi użytkownika:
 * - Dobór przepisów według przedziału kalorycznego (target ± 15%)
 * - Losowy wybór z dostępnych przepisów
 * - Zapewnienie różnorodności (brak powtórzeń przepisów w tym samym dniu)
 * - Walidacja makroskładników (suma 3 posiłków ≈ cele dzienne)
 * - Optymalizacja przez redukcję składników (max 20%)
 */

import { supabase } from '@/src/lib/supabase/client'
import type { Database } from '@/src/types/database.types'

type MealType = Database['public']['Enums']['meal_type_enum']
type PlannedMealInsert = Database['public']['Tables']['planned_meals']['Insert']

/**
 * Typ profilu użytkownika (wyciąg z tabeli profiles)
 */
type UserProfile = {
  id: string
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
}

/**
 * Typ przepisu z bazy danych (dla generatora)
 */
type Recipe = {
  id: number
  name: string
  meal_types: MealType[]
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
}

/**
 * Typ dla pełnych danych przepisu (z recipe_ingredients)
 */
type RecipeWithIngredients = Recipe & {
  recipe_ingredients: {
    ingredient_id: number
    base_amount: number
    unit: string
    is_scalable: boolean
    calories: number | null
    protein_g: number | null
    carbs_g: number | null
    fats_g: number | null
  }[]
}

/**
 * Typ nadpisań składników
 */
type IngredientOverride = {
  ingredient_id: number
  new_amount: number
  auto_adjusted?: boolean
}

/**
 * Tolerancja różnicy kalorycznej dla pojedynczego posiłku (±15%)
 */
const CALORIE_TOLERANCE = 0.15

/**
 * Liczba dni do wygenerowania w planie
 */
const DAYS_TO_GENERATE = 7

/**
 * Typy posiłków w kolejności (3 posiłki dziennie)
 */
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']

/**
 * Maksymalna procentowa zmiana ilości składnika podczas optymalizacji (20%)
 */
const MAX_INGREDIENT_CHANGE_PERCENT = 0.2

/**
 * Zaokrąglanie ilości składników do wielokrotności (5g)
 */
const INGREDIENT_ROUNDING_STEP = 5

/**
 * Próg nadmiaru makroskładnika (białko/węgle/tłuszcze) do optymalizacji (>105% zapotrzebowania)
 */
const MACRO_SURPLUS_THRESHOLD_PERCENT = 1.05

/**
 * Typ makroskładnika
 */
type MacroType = 'protein' | 'carbs' | 'fats'

/**
 * Zaokrągla ilość składnika do najbliższej wielokrotności INGREDIENT_ROUNDING_STEP
 */
function roundIngredientAmount(amount: number): number {
  return (
    Math.round(amount / INGREDIENT_ROUNDING_STEP) * INGREDIENT_ROUNDING_STEP
  )
}

/**
 * Oblicza docelowe kalorie dla pojedynczego posiłku
 * Równy podział na 3 posiłki dziennie
 */
function calculateMealCalorieRange(dailyCalories: number): {
  min: number
  max: number
  target: number
} {
  const target = dailyCalories / 3
  const min = target * (1 - CALORIE_TOLERANCE)
  const max = target * (1 + CALORIE_TOLERANCE)

  return { min, max, target }
}

/**
 * Oblicza makroskładniki dla pojedynczego przepisu z uwzględnieniem nadpisań
 */
function calculateRecipeMacros(
  recipe: RecipeWithIngredients,
  overrides?: IngredientOverride[]
): {
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
} {
  if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
    return {
      calories: recipe.total_calories || 0,
      protein_g: recipe.total_protein_g || 0,
      carbs_g: recipe.total_carbs_g || 0,
      fats_g: recipe.total_fats_g || 0,
    }
  }

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFats = 0

  for (const ingredient of recipe.recipe_ingredients) {
    const override = overrides?.find(
      (o) => o.ingredient_id === ingredient.ingredient_id
    )
    const baseAmount = ingredient.base_amount
    const adjustedAmount = override?.new_amount ?? baseAmount

    if (baseAmount === 0) continue

    const scale = adjustedAmount / baseAmount

    totalCalories += (ingredient.calories || 0) * scale
    totalProtein += (ingredient.protein_g || 0) * scale
    totalCarbs += (ingredient.carbs_g || 0) * scale
    totalFats += (ingredient.fats_g || 0) * scale
  }

  return {
    calories: Math.round(totalCalories),
    protein_g: Math.round(totalProtein * 10) / 10,
    carbs_g: Math.round(totalCarbs * 10) / 10,
    fats_g: Math.round(totalFats * 10) / 10,
  }
}

/**
 * Oblicza nadmiar makroskładników dla dnia
 */
function calculateMacroSurplus(
  dayMacros: {
    protein_g: number
    carbs_g: number
    fats_g: number
  },
  targets: {
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
): {
  protein: number
  carbs: number
  fats: number
} {
  return {
    protein: dayMacros.protein_g - targets.target_protein_g,
    carbs: dayMacros.carbs_g - targets.target_carbs_g,
    fats: dayMacros.fats_g - targets.target_fats_g,
  }
}

/**
 * Sprawdza czy makroskładnik wymaga optymalizacji
 */
function shouldOptimizeMacro(
  dayMacros: {
    protein_g: number
    carbs_g: number
    fats_g: number
  },
  targets: {
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  },
  macroType: MacroType
): boolean {
  const macroValue =
    macroType === 'protein'
      ? dayMacros.protein_g
      : macroType === 'carbs'
        ? dayMacros.carbs_g
        : dayMacros.fats_g

  const targetValue =
    macroType === 'protein'
      ? targets.target_protein_g
      : macroType === 'carbs'
        ? targets.target_carbs_g
        : targets.target_fats_g

  if (targetValue === 0) return false

  const percentOfTarget = macroValue / targetValue

  return percentOfTarget > MACRO_SURPLUS_THRESHOLD_PERCENT
}

/**
 * Znajduje makroskładnik, który najbardziej wymaga optymalizacji
 */
function findMacroForOptimization(
  surplus: {
    protein: number
    carbs: number
    fats: number
  },
  dayMacros: {
    protein_g: number
    carbs_g: number
    fats_g: number
  },
  targets: {
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
): MacroType | null {
  const validMacros = Object.entries(surplus)
    .filter(([key, value]) => {
      if (value <= 0) return false
      const macroType = key as MacroType
      return shouldOptimizeMacro(dayMacros, targets, macroType)
    })
    .sort(([, a], [, b]) => b - a)

  if (validMacros.length === 0) {
    return null
  }

  const firstEntry = validMacros[0]
  if (!firstEntry) {
    return null
  }

  return firstEntry[0] as MacroType
}

/**
 * Znajduje składnik w przepisie odpowiedzialny za największy udział danego makroskładnika
 */
function findIngredientForMacro(
  recipe: RecipeWithIngredients,
  macroType: MacroType
): { ingredient_id: number; macro_value: number; is_scalable: boolean } | null {
  if (!recipe.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
    return null
  }

  const macroField =
    macroType === 'protein'
      ? 'protein_g'
      : macroType === 'carbs'
        ? 'carbs_g'
        : 'fats_g'

  const scalableIngredients = recipe.recipe_ingredients
    .filter((ing) => ing.is_scalable && (ing[macroField] || 0) > 0)
    .sort((a, b) => (b[macroField] || 0) - (a[macroField] || 0))

  if (scalableIngredients.length === 0) {
    return null
  }

  const topIngredient = scalableIngredients[0]
  if (!topIngredient) {
    return null
  }

  return {
    ingredient_id: topIngredient.ingredient_id,
    macro_value: topIngredient[macroField] || 0,
    is_scalable: topIngredient.is_scalable,
  }
}

/**
 * Oblicza nową ilość składnika aby zredukować nadmiar makroskładnika
 */
function calculateAdjustedAmount(
  ingredient: {
    base_amount: number
    protein_g: number | null
    carbs_g: number | null
    fats_g: number | null
  },
  macroType: MacroType,
  targetReduction: number
): { newAmount: number; actualReduction: number } {
  const macroField =
    macroType === 'protein'
      ? 'protein_g'
      : macroType === 'carbs'
        ? 'carbs_g'
        : 'fats_g'

  const macroPerBaseAmount = ingredient[macroField] || 0

  if (macroPerBaseAmount === 0) {
    return { newAmount: ingredient.base_amount, actualReduction: 0 }
  }

  const amountToReduce =
    (targetReduction / macroPerBaseAmount) * ingredient.base_amount

  const maxReduction = ingredient.base_amount * MAX_INGREDIENT_CHANGE_PERCENT
  const actualAmountReduction = Math.min(amountToReduce, maxReduction)

  const newAmount = Math.max(0, ingredient.base_amount - actualAmountReduction)
  const roundedAmount = roundIngredientAmount(newAmount)

  const finalReduction =
    ((ingredient.base_amount - roundedAmount) / ingredient.base_amount) *
    macroPerBaseAmount

  return {
    newAmount: roundedAmount,
    actualReduction: Math.round(finalReduction * 10) / 10,
  }
}

/**
 * Losuje przepis z listy dostępnych przepisów
 */
function selectRandomRecipe(
  recipes: RecipeWithIngredients[]
): RecipeWithIngredients | null {
  if (recipes.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * recipes.length)
  return recipes[randomIndex] || null
}

/**
 * Pobiera przepisy z bazy danych zgodne z kryteriami
 */
async function fetchRecipesForMeal(
  mealType: MealType,
  minCalories: number,
  maxCalories: number
): Promise<RecipeWithIngredients[]> {
  const minCal = Math.floor(minCalories)
  const maxCal = Math.ceil(maxCalories)

  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      id,
      name,
      meal_types,
      total_calories,
      total_protein_g,
      total_carbs_g,
      total_fats_g,
      recipe_ingredients (
        ingredient_id,
        base_amount,
        unit,
        is_scalable,
        calories,
        protein_g,
        carbs_g,
        fats_g
      )
      `
    )
    .contains('meal_types', [mealType])
    .gte('total_calories', minCal)
    .lte('total_calories', maxCal)
    .not('total_calories', 'is', null)

  if (error) {
    console.error(`Błąd podczas pobierania przepisów dla ${mealType}:`, error)
    throw new Error(`Nie udało się pobrać przepisów: ${error.message}`)
  }

  return (data || []) as RecipeWithIngredients[]
}

/**
 * Zapewnia różnorodność przepisów w ramach jednego dnia
 */
function ensureVariety(
  recipe: RecipeWithIngredients,
  usedRecipeIds: Set<number>
): boolean {
  return !usedRecipeIds.has(recipe.id)
}

/**
 * Wybiera przepis dla pojedynczego posiłku
 */
async function selectRecipeForMeal(
  mealType: MealType,
  calorieRange: { min: number; max: number },
  usedRecipeIds: Set<number>
): Promise<RecipeWithIngredients | null> {
  const allRecipes = await fetchRecipesForMeal(
    mealType,
    calorieRange.min,
    calorieRange.max
  )

  const availableRecipes = allRecipes.filter((recipe) =>
    ensureVariety(recipe, usedRecipeIds)
  )

  const recipesToChooseFrom =
    availableRecipes.length > 0 ? availableRecipes : allRecipes

  return selectRandomRecipe(recipesToChooseFrom)
}

/**
 * Optymalizuje plan dnia przez redukcję kalorii
 */
function optimizeByCalories(
  dayPlan: PlannedMealInsert[],
  selectedRecipes: RecipeWithIngredients[],
  calorieTarget: number
): PlannedMealInsert[] {
  let bestRecipeIndex = -1
  let bestIngredient: {
    ingredient_id: number
    calories: number
    is_scalable: boolean
  } | null = null

  for (let i = 0; i < selectedRecipes.length; i++) {
    const recipe = selectedRecipes[i]
    if (!recipe || !recipe.recipe_ingredients) continue

    for (const ing of recipe.recipe_ingredients) {
      if (!ing.is_scalable || !ing.calories || ing.calories <= 0) continue

      if (!bestIngredient || ing.calories > bestIngredient.calories) {
        bestRecipeIndex = i
        bestIngredient = {
          ingredient_id: ing.ingredient_id,
          calories: ing.calories,
          is_scalable: ing.is_scalable,
        }
      }
    }
  }

  if (bestRecipeIndex === -1 || !bestIngredient) {
    console.log('⚠️  Nie znaleziono składnika do redukcji kalorii')
    return dayPlan
  }

  const recipe = selectedRecipes[bestRecipeIndex]
  if (!recipe) return dayPlan

  const ingredientData = recipe.recipe_ingredients.find(
    (ri) => ri.ingredient_id === bestIngredient.ingredient_id
  )

  if (!ingredientData) return dayPlan

  const calories = ingredientData.calories || 0
  if (calories === 0 || ingredientData.base_amount === 0) {
    return dayPlan
  }

  const caloriesPerGram = calories / ingredientData.base_amount
  const gramsToReduce = calorieTarget / caloriesPerGram

  const maxReduction =
    ingredientData.base_amount * MAX_INGREDIENT_CHANGE_PERCENT
  const actualGramsReduction = Math.min(gramsToReduce, maxReduction)
  const newAmount = Math.max(
    0,
    ingredientData.base_amount - actualGramsReduction
  )

  const roundedAmount = roundIngredientAmount(newAmount)

  const optimizedPlan = [...dayPlan]
  const mealToUpdate = optimizedPlan[bestRecipeIndex]

  if (mealToUpdate) {
    mealToUpdate.ingredient_overrides = [
      {
        ingredient_id: bestIngredient.ingredient_id,
        new_amount: roundedAmount,
        auto_adjusted: true,
      },
    ] as any
  }

  return optimizedPlan
}

/**
 * Optymalizuje plan dnia aby zmieścić się w celach kalorycznych i makroskładników
 *
 * Logika:
 * 1. Kalorie ZAWSZE muszą być ≤100% dziennego zapotrzebowania
 * 2. Makro (białko/węgle/tłuszcze) optymalizujemy gdy >105%
 */
function optimizeDayPlan(
  dayPlan: PlannedMealInsert[],
  selectedRecipes: RecipeWithIngredients[],
  targets: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
): PlannedMealInsert[] {
  let dayCalories = 0
  const dayMacros = {
    protein_g: 0,
    carbs_g: 0,
    fats_g: 0,
  }

  for (const recipe of selectedRecipes) {
    const macros = calculateRecipeMacros(recipe)
    dayCalories += macros.calories
    dayMacros.protein_g += macros.protein_g
    dayMacros.carbs_g += macros.carbs_g
    dayMacros.fats_g += macros.fats_g
  }

  console.log(
    `📊 Plan dnia: ${dayCalories} kcal (cel: ${targets.target_calories}), P: ${dayMacros.protein_g}g, C: ${dayMacros.carbs_g}g, F: ${dayMacros.fats_g}g`
  )

  // PRIORYTET: Sprawdź kalorie
  if (dayCalories > targets.target_calories) {
    const caloriePercent = (
      (dayCalories / targets.target_calories) *
      100
    ).toFixed(1)
    const calorieSurplus = dayCalories - targets.target_calories

    console.log(
      `🎯 OPTYMALIZACJA KALORII: ${caloriePercent}% zapotrzebowania, nadmiar: ${calorieSurplus.toFixed(0)} kcal`
    )

    return optimizeByCalories(dayPlan, selectedRecipes, calorieSurplus)
  }

  // Sprawdź makroskładniki
  const surplus = calculateMacroSurplus(dayMacros, targets)
  const macroToOptimize = findMacroForOptimization(surplus, dayMacros, targets)

  if (!macroToOptimize) {
    console.log('✅ Plan dnia OK - brak potrzeby optymalizacji')
    return dayPlan
  }

  const macroValue =
    macroToOptimize === 'protein'
      ? dayMacros.protein_g
      : macroToOptimize === 'carbs'
        ? dayMacros.carbs_g
        : dayMacros.fats_g

  const targetValue =
    macroToOptimize === 'protein'
      ? targets.target_protein_g
      : macroToOptimize === 'carbs'
        ? targets.target_carbs_g
        : targets.target_fats_g

  const percentOfTarget = ((macroValue / targetValue) * 100).toFixed(1)

  console.log(
    `🎯 OPTYMALIZACJA MAKRO: nadmiar ${macroToOptimize} = ${surplus[macroToOptimize].toFixed(1)}g (${percentOfTarget}% zapotrzebowania)`
  )

  let bestRecipeIndex = -1
  let bestIngredient: {
    ingredient_id: number
    macro_value: number
    is_scalable: boolean
  } | null = null

  for (let i = 0; i < selectedRecipes.length; i++) {
    const recipe = selectedRecipes[i]
    if (!recipe) continue

    const ingredient = findIngredientForMacro(recipe, macroToOptimize)

    if (
      ingredient &&
      ingredient.is_scalable &&
      (!bestIngredient || ingredient.macro_value > bestIngredient.macro_value)
    ) {
      bestRecipeIndex = i
      bestIngredient = ingredient
    }
  }

  if (bestRecipeIndex === -1 || !bestIngredient) {
    console.log('⚠️  Nie znaleziono skalowanego składnika do optymalizacji')
    return dayPlan
  }

  const recipe = selectedRecipes[bestRecipeIndex]
  if (!recipe) {
    return dayPlan
  }

  const ingredientData = recipe.recipe_ingredients.find(
    (ri) => ri.ingredient_id === bestIngredient.ingredient_id
  )

  if (!ingredientData) {
    return dayPlan
  }

  const targetReduction = surplus[macroToOptimize]
  const { newAmount } = calculateAdjustedAmount(
    ingredientData,
    macroToOptimize,
    targetReduction
  )

  const optimizedPlan = [...dayPlan]
  const mealToUpdate = optimizedPlan[bestRecipeIndex]

  if (mealToUpdate) {
    mealToUpdate.ingredient_overrides = [
      {
        ingredient_id: bestIngredient.ingredient_id,
        new_amount: newAmount,
        auto_adjusted: true,
      },
    ] as any
  }

  return optimizedPlan
}

/**
 * Generuje plan posiłków dla pojedynczego dnia z automatyczną optymalizacją
 */
export async function generateDayPlan(
  userId: string,
  date: string,
  userProfile: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
): Promise<PlannedMealInsert[]> {
  const dayPlan: PlannedMealInsert[] = []
  const selectedRecipes: RecipeWithIngredients[] = []
  const usedRecipeIds = new Set<number>()

  for (const mealType of MEAL_TYPES) {
    const calorieRange = calculateMealCalorieRange(userProfile.target_calories)

    const recipe = await selectRecipeForMeal(
      mealType,
      calorieRange,
      usedRecipeIds
    )

    if (!recipe) {
      throw new Error(
        `Nie znaleziono przepisu dla ${mealType} w przedziale ${calorieRange.min}-${calorieRange.max} kcal`
      )
    }

    usedRecipeIds.add(recipe.id)
    selectedRecipes.push(recipe)
    dayPlan.push({
      user_id: userId,
      recipe_id: recipe.id,
      meal_date: date,
      meal_type: mealType,
      is_eaten: false,
      ingredient_overrides: null,
    })
  }

  const optimizedPlan = optimizeDayPlan(dayPlan, selectedRecipes, {
    target_calories: userProfile.target_calories,
    target_protein_g: userProfile.target_protein_g,
    target_carbs_g: userProfile.target_carbs_g,
    target_fats_g: userProfile.target_fats_g,
  })

  return optimizedPlan
}

/**
 * Generuje daty dla kolejnych N dni od dzisiaj
 */
function generateDates(
  startDate: Date = new Date(),
  numDays: number
): string[] {
  const dates: string[] = []

  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    dates.push(date.toISOString().split('T')[0]!)
  }

  return dates
}

/**
 * Główna funkcja - generuje 7-dniowy plan posiłków dla użytkownika
 */
export async function generateWeeklyPlan(
  userProfile: UserProfile,
  startDate: Date = new Date()
): Promise<PlannedMealInsert[]> {
  try {
    const weeklyPlan: PlannedMealInsert[] = []

    const dates = generateDates(startDate, DAYS_TO_GENERATE)

    for (const date of dates) {
      const dayPlan = await generateDayPlan(userProfile.id, date, {
        target_calories: userProfile.target_calories,
        target_protein_g: userProfile.target_protein_g,
        target_carbs_g: userProfile.target_carbs_g,
        target_fats_g: userProfile.target_fats_g,
      })

      weeklyPlan.push(...dayPlan)
    }

    if (weeklyPlan.length !== DAYS_TO_GENERATE * MEAL_TYPES.length) {
      throw new Error(
        `Nieprawidłowa liczba posiłków w planie: ${weeklyPlan.length}, oczekiwano ${DAYS_TO_GENERATE * MEAL_TYPES.length}`
      )
    }

    return weeklyPlan
  } catch (error) {
    console.error('Błąd podczas generowania planu posiłków:', error)
    throw error
  }
}

/**
 * Sprawdza czy plan posiłków już istnieje dla użytkownika w danym zakresie dat
 */
export async function checkExistingPlan(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const { count, error } = await supabase
    .from('planned_meals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('meal_date', startDate)
    .lte('meal_date', endDate)

  if (error) {
    console.error('Błąd podczas sprawdzania istniejącego planu:', error)
    throw new Error(`Nie udało się sprawdzić planu: ${error.message}`)
  }

  return count || 0
}

/**
 * Znajduje dni, które nie mają jeszcze kompletnego planu (3 posiłków)
 */
export async function findMissingDays(
  userId: string,
  dates: string[]
): Promise<string[]> {
  const { data: existingMeals, error } = await supabase
    .from('planned_meals')
    .select('meal_date, meal_type')
    .eq('user_id', userId)
    .in('meal_date', dates)

  if (error) {
    console.error('Błąd podczas sprawdzania istniejących dni:', error)
    throw new Error(
      `Nie udało się sprawdzić istniejących dni: ${error.message}`
    )
  }

  const mealsByDate = new Map<string, Set<string>>()
  for (const meal of existingMeals || []) {
    if (!mealsByDate.has(meal.meal_date)) {
      mealsByDate.set(meal.meal_date, new Set())
    }
    mealsByDate.get(meal.meal_date)!.add(meal.meal_type)
  }

  const missingDays: string[] = []
  for (const date of dates) {
    const mealsForDay = mealsByDate.get(date)
    const hasAllMeals = mealsForDay?.size === 3
    if (!hasAllMeals) {
      missingDays.push(date)
    }
  }

  return missingDays
}

/**
 * Usuwa stare plany posiłków (dni przed dzisiejszym)
 */
export async function cleanupOldMealPlans(userId: string): Promise<number> {
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatLocalDate(today)

  console.log(`🧹 Czyszczenie starych planów przed datą: ${todayStr}`)

  const { data, error } = await supabase
    .from('planned_meals')
    .delete()
    .eq('user_id', userId)
    .lt('meal_date', todayStr)
    .select('id')

  if (error) {
    console.error('Błąd podczas czyszczenia starych planów:', error)
    throw new Error(`Nie udało się usunąć starych planów: ${error.message}`)
  }

  const deletedCount = data?.length || 0
  if (deletedCount > 0) {
    console.log(`✅ Usunięto ${deletedCount} starych posiłków`)
  }

  return deletedCount
}
