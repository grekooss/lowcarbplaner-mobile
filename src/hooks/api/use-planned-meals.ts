/**
 * usePlannedMeals Hook
 *
 * Hook do zarządzania zaplanowanymi posiłkami:
 * - Pobieranie posiłków na dany dzień
 * - Pobieranie posiłków na zakres dat (tydzień)
 * - Oznaczanie posiłku jako zjedzony
 * - Aktualizacja ilości składnika
 * - Wymiana posiłku
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@src/lib/supabase/client'
import Toast from 'react-native-toast-message'
import type { PlannedMealDTO } from '@src/types/dto.types'
// import utilities if needed in future

/**
 * Query keys dla zaplanowanych posiłków
 */
export const plannedMealsKeys = {
  all: ['planned-meals'] as const,
  byDate: (date: string) => [...plannedMealsKeys.all, 'date', date] as const,
  byRange: (startDate: string, endDate: string) =>
    [...plannedMealsKeys.all, 'range', startDate, endDate] as const,
}

/**
 * Hook do pobierania zaplanowanych posiłków na dany dzień
 *
 * @param date - Data w formacie YYYY-MM-DD
 * @returns Query z listą posiłków
 *
 * @example
 * ```tsx
 * function DashboardScreen() {
 *   const { data: meals, isLoading } = usePlannedMeals('2025-11-02')
 *
 *   if (isLoading) return <Loading />
 *   return <MealsList meals={meals} />
 * }
 * ```
 */
export function usePlannedMeals(date: string) {
  return useQuery({
    queryKey: plannedMealsKeys.byDate(date),
    queryFn: async (): Promise<PlannedMealDTO[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Nie jesteś zalogowany')
      }

      // Pobierz zaplanowane posiłki z joinami
      const { data, error } = await supabase
        .from('planned_meals')
        .select(
          `
          id,
          meal_date,
          meal_type,
          is_eaten,
          ingredient_overrides,
          created_at,
          recipe:recipes (
            id,
            name,
            instructions,
            meal_types,
            tags,
            image_url,
            difficulty_level,
            average_rating,
            reviews_count,
            health_score,
            total_calories,
            total_protein_g,
            total_carbs_g,
            total_fats_g,
            recipe_ingredients (
              base_amount,
              unit,
              calories,
              protein_g,
              carbs_g,
              fats_g,
              is_scalable,
              ingredient:ingredients (
                id,
                name,
                category
              )
            )
          )
        `
        )
        .eq('user_id', user.id)
        .eq('meal_date', date)
        .order('meal_type', { ascending: true })

      if (error) {
        throw new Error(`Błąd pobierania posiłków: ${error.message}`)
      }

      // Transform do PlannedMealDTO
      const meals: PlannedMealDTO[] = (data || []).map((meal: any) => ({
        id: meal.id,
        meal_date: meal.meal_date,
        meal_type: meal.meal_type,
        is_eaten: meal.is_eaten,
        ingredient_overrides: meal.ingredient_overrides,
        created_at: meal.created_at,
        recipe: {
          id: meal.recipe.id,
          name: meal.recipe.name,
          instructions: meal.recipe.instructions,
          meal_types: meal.recipe.meal_types,
          tags: meal.recipe.tags,
          image_url: meal.recipe.image_url,
          difficulty_level: meal.recipe.difficulty_level,
          average_rating: meal.recipe.average_rating,
          reviews_count: meal.recipe.reviews_count,
          health_score: meal.recipe.health_score,
          total_calories: meal.recipe.total_calories,
          total_protein_g: meal.recipe.total_protein_g,
          total_carbs_g: meal.recipe.total_carbs_g,
          total_fats_g: meal.recipe.total_fats_g,
          ingredients: meal.recipe.recipe_ingredients.map((ri: any) => ({
            id: ri.ingredient.id,
            name: ri.ingredient.name,
            amount: ri.base_amount,
            unit: ri.unit,
            calories: ri.calories,
            protein_g: ri.protein_g,
            carbs_g: ri.carbs_g,
            fats_g: ri.fats_g,
            category: ri.ingredient.category,
            is_scalable: ri.is_scalable,
          })),
        },
      }))

      return meals
    },
    staleTime: 2 * 60 * 1000, // 2 minuty
    retry: 1,
  })
}

/**
 * Hook do pobierania zaplanowanych posiłków na zakres dat (tydzień)
 *
 * @param startDate - Data początkowa YYYY-MM-DD
 * @param endDate - Data końcowa YYYY-MM-DD
 * @returns Query z listą posiłków
 */
export function usePlannedMealsRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: plannedMealsKeys.byRange(startDate, endDate),
    queryFn: async (): Promise<PlannedMealDTO[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Nie jesteś zalogowany')
      }

      const { data, error } = await supabase
        .from('planned_meals')
        .select(
          `
          id,
          meal_date,
          meal_type,
          is_eaten,
          ingredient_overrides,
          created_at,
          recipe:recipes (
            id,
            name,
            instructions,
            meal_types,
            tags,
            image_url,
            difficulty_level,
            average_rating,
            reviews_count,
            health_score,
            total_calories,
            total_protein_g,
            total_carbs_g,
            total_fats_g,
            recipe_ingredients (
              base_amount,
              unit,
              calories,
              protein_g,
              carbs_g,
              fats_g,
              is_scalable,
              ingredient:ingredients (
                id,
                name,
                category
              )
            )
          )
        `
        )
        .eq('user_id', user.id)
        .gte('meal_date', startDate)
        .lte('meal_date', endDate)
        .order('meal_date', { ascending: true })
        .order('meal_type', { ascending: true })

      if (error) {
        throw new Error(`Błąd pobierania posiłków: ${error.message}`)
      }

      // Transform (ta sama logika jak wyżej)
      const meals: PlannedMealDTO[] = (data || []).map((meal: any) => ({
        id: meal.id,
        meal_date: meal.meal_date,
        meal_type: meal.meal_type,
        is_eaten: meal.is_eaten,
        ingredient_overrides: meal.ingredient_overrides,
        created_at: meal.created_at,
        recipe: {
          id: meal.recipe.id,
          name: meal.recipe.name,
          instructions: meal.recipe.instructions,
          meal_types: meal.recipe.meal_types,
          tags: meal.recipe.tags,
          image_url: meal.recipe.image_url,
          difficulty_level: meal.recipe.difficulty_level,
          average_rating: meal.recipe.average_rating,
          reviews_count: meal.recipe.reviews_count,
          health_score: meal.recipe.health_score,
          total_calories: meal.recipe.total_calories,
          total_protein_g: meal.recipe.total_protein_g,
          total_carbs_g: meal.recipe.total_carbs_g,
          total_fats_g: meal.recipe.total_fats_g,
          ingredients: meal.recipe.recipe_ingredients.map((ri: any) => ({
            id: ri.ingredient.id,
            name: ri.ingredient.name,
            amount: ri.base_amount,
            unit: ri.unit,
            calories: ri.calories,
            protein_g: ri.protein_g,
            carbs_g: ri.carbs_g,
            fats_g: ri.fats_g,
            category: ri.ingredient.category,
            is_scalable: ri.is_scalable,
          })),
        },
      }))

      return meals
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

/**
 * Hook do oznaczania posiłku jako zjedzony/niezjedzony
 *
 * @returns Mutation do aktualizacji stanu is_eaten
 */
export function useToggleMealEaten() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mealId,
      isEaten,
    }: {
      mealId: number
      isEaten: boolean
    }) => {
      const { data, error } = await supabase
        .from('planned_meals')
        .update({ is_eaten: isEaten })
        .eq('id', mealId)
        .select()
        .single()

      if (error) {
        throw new Error(`Błąd aktualizacji posiłku: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate queries dla tej daty
      queryClient.invalidateQueries({
        queryKey: plannedMealsKeys.byDate(data.meal_date),
      })

      Toast.show({
        type: 'success',
        text1: data.is_eaten ? 'Posiłek zjedzony' : 'Posiłek cofnięty',
        text2: data.is_eaten
          ? 'Oznaczyłeś posiłek jako zjedzony'
          : 'Cofnąłeś oznaczenie posiłku',
        visibilityTime: 2000,
      })
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Błąd',
        text2: error.message,
      })
    },
  })
}

/**
 * Hook do aktualizacji ilości składnika w posiłku
 *
 * @returns Mutation do modyfikacji ingredient_overrides
 */
export function useUpdateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mealId,
      ingredientId,
      newAmount,
    }: {
      mealId: number
      ingredientId: number
      newAmount: number
    }) => {
      // Pobierz aktualny posiłek
      const { data: meal, error: fetchError } = await supabase
        .from('planned_meals')
        .select('ingredient_overrides, meal_date')
        .eq('id', mealId)
        .single()

      if (fetchError) {
        throw new Error(`Błąd pobierania posiłku: ${fetchError.message}`)
      }

      // Zaktualizuj ingredient_overrides
      const overrides = (meal.ingredient_overrides as any[]) || []
      const existingIndex = overrides.findIndex(
        (o: any) => o.ingredient_id === ingredientId
      )

      let updatedOverrides
      if (existingIndex >= 0) {
        // Aktualizuj istniejący override
        updatedOverrides = [...overrides]
        updatedOverrides[existingIndex] = {
          ingredient_id: ingredientId,
          new_amount: newAmount,
          auto_adjusted: false,
        }
      } else {
        // Dodaj nowy override
        updatedOverrides = [
          ...overrides,
          {
            ingredient_id: ingredientId,
            new_amount: newAmount,
            auto_adjusted: false,
          },
        ]
      }

      // Zapisz zaktualizowane overrides
      const { data, error } = await supabase
        .from('planned_meals')
        .update({ ingredient_overrides: updatedOverrides })
        .eq('id', mealId)
        .select()
        .single()

      if (error) {
        throw new Error(`Błąd aktualizacji składnika: ${error.message}`)
      }

      return { ...data, meal_date: meal.meal_date }
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: plannedMealsKeys.byDate(data.meal_date),
      })

      Toast.show({
        type: 'success',
        text1: 'Składnik zaktualizowany',
        text2: 'Ilość składnika została zmieniona',
        visibilityTime: 2000,
      })
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Błąd aktualizacji',
        text2: error.message,
      })
    },
  })
}

/**
 * Hook do generowania planu posiłków na tydzień
 *
 * @returns Mutation do generowania 7-dniowego planu
 */
export function useGenerateMealPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Nie jesteś zalogowany')
      }

      // Oblicz zakres dat (dzisiaj + 6 dni)
      const today = new Date()
      const startDate = today.toISOString().split('T')[0]
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 6)
      const endDateStr = endDate.toISOString().split('T')[0]

      // Wywołaj funkcję Edge do generowania planu
      const { data, error } = await supabase.functions.invoke(
        'generate-meal-plan',
        {
          body: {
            start_date: startDate,
            end_date: endDateStr,
          },
        }
      )

      if (error) {
        throw new Error(`Błąd generowania planu: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate wszystkie queries dla planned meals
      queryClient.invalidateQueries({
        queryKey: plannedMealsKeys.all,
      })

      Toast.show({
        type: 'success',
        text1: 'Plan wygenerowany',
        text2: `Utworzono ${data.generated_count} posiłków na 7 dni`,
        visibilityTime: 3000,
      })
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Błąd generowania planu',
        text2: error.message,
        visibilityTime: 4000,
      })
    },
  })
}

/**
 * Hook do wymiany przepisu w posiłku
 *
 * @returns Mutation do zamiany recipe_id
 */
export function useSwapMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mealId,
      newRecipeId,
    }: {
      mealId: number
      newRecipeId: number
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Nie jesteś zalogowany')
      }

      // Pobierz aktualny posiłek
      const { data: meal, error: fetchError } = await supabase
        .from('planned_meals')
        .select(
          'meal_date, meal_type, recipe:recipes(total_calories, meal_types)'
        )
        .eq('id', mealId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        throw new Error(`Błąd pobierania posiłku: ${fetchError.message}`)
      }

      // Pobierz nowy przepis
      const { data: newRecipe, error: recipeError } = await supabase
        .from('recipes')
        .select('meal_types, total_calories')
        .eq('id', newRecipeId)
        .single()

      if (recipeError) {
        throw new Error(`Błąd pobierania przepisu: ${recipeError.message}`)
      }

      // Walidacja meal_type
      if (!newRecipe.meal_types.includes(meal.meal_type)) {
        throw new Error('Przepis nie pasuje do typu posiłku')
      }

      // Walidacja kalorii (±15%)
      const originalRecipe = meal.recipe as any
      const originalCalories = originalRecipe.total_calories || 0
      const newCalories = newRecipe.total_calories || 0
      const diffPercent =
        Math.abs((newCalories - originalCalories) / originalCalories) * 100

      if (diffPercent > 15) {
        throw new Error('Różnica kaloryczna przekracza ±15%')
      }

      // Zamień przepis i zresetuj ingredient_overrides
      const { data, error } = await supabase
        .from('planned_meals')
        .update({
          recipe_id: newRecipeId,
          ingredient_overrides: null,
        })
        .eq('id', mealId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Błąd wymiany przepisu: ${error.message}`)
      }

      return { ...data, meal_date: meal.meal_date }
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: plannedMealsKeys.byDate(data.meal_date),
      })
      queryClient.invalidateQueries({
        queryKey: plannedMealsKeys.all,
      })

      Toast.show({
        type: 'success',
        text1: 'Przepis zamieniony',
        text2: 'Posiłek został zaktualizowany nowym przepisem',
        visibilityTime: 2000,
      })
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Błąd zamiany',
        text2: error.message,
        visibilityTime: 3000,
      })
    },
  })
}

/**
 * Hook do pobierania zamienników dla posiłku
 *
 * @param mealId - ID posiłku do zamiany
 * @returns Query z listą zamienników
 */
export function useMealReplacements(mealId: number | null) {
  return useQuery({
    queryKey: [...plannedMealsKeys.all, 'replacements', mealId],
    queryFn: async () => {
      if (!mealId) return []

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Nie jesteś zalogowany')
      }

      // Pobierz oryginalny posiłek
      const { data: meal, error: mealError } = await supabase
        .from('planned_meals')
        .select(
          `
          meal_type,
          recipe:recipes (
            total_calories,
            meal_types
          )
        `
        )
        .eq('id', mealId)
        .eq('user_id', user.id)
        .single()

      if (mealError) {
        throw new Error(`Błąd pobierania posiłku: ${mealError.message}`)
      }

      const originalRecipe = meal.recipe as any
      const originalCalories = originalRecipe.total_calories || 0
      const mealType = meal.meal_type

      // Oblicz zakres kalorii (±15%)
      const minCalories = originalCalories * 0.85
      const maxCalories = originalCalories * 1.15

      // Pobierz zamienniki
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select(
          `
          id,
          name,
          image_url,
          meal_types,
          total_calories,
          total_protein_g,
          total_carbs_g,
          total_fats_g
        `
        )
        .contains('meal_types', [mealType])
        .gte('total_calories', minCalories)
        .lte('total_calories', maxCalories)
        .order('total_calories', { ascending: true })
        .limit(10)

      if (recipesError) {
        throw new Error(`Błąd pobierania zamienników: ${recipesError.message}`)
      }

      // Dodaj calorie_diff
      const replacements = recipes.map((recipe) => ({
        ...recipe,
        calorie_diff: (recipe.total_calories || 0) - originalCalories,
      }))

      return replacements
    },
    staleTime: 10 * 60 * 1000, // 10 minut
    enabled: !!mealId,
  })
}
