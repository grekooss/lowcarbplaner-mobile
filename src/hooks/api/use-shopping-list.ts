/**
 * useShoppingList Hook
 *
 * Zarządzanie listą zakupów:
 * - Generowanie listy zakupów na podstawie planned_meals
 * - Agregacja składników po kategorii
 * - Oznaczanie składników jako kupione
 * - Czyszczenie listy
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@src/lib/supabase/client'
import Toast from 'react-native-toast-message'

// ==================== QUERY KEYS ====================

export const shoppingListKeys = {
  all: ['shopping-list'] as const,
  byDateRange: (startDate: string, endDate: string) =>
    [...shoppingListKeys.all, 'date-range', startDate, endDate] as const,
}

// ==================== TYPES ====================

export interface ShoppingListItem {
  ingredient_id: number
  ingredient_name: string
  ingredient_category: string
  total_amount: number
  unit: string
  is_purchased: boolean
}

export interface ShoppingListByCategory {
  category: string
  items: ShoppingListItem[]
}

// ==================== HOOKS ====================

/**
 * Generuje listę zakupów na podstawie planned_meals w zakresie dat
 */
export function useShoppingList(startDate: string, endDate: string) {
  return useQuery({
    queryKey: shoppingListKeys.byDateRange(startDate, endDate),
    queryFn: async (): Promise<ShoppingListByCategory[]> => {
      // 1. Pobierz wszystkie planned_meals w zakresie dat
      const { data: plannedMeals, error: mealsError } = await supabase
        .from('planned_meals')
        .select(
          `
          id,
          meal_date,
          recipe:recipes (
            id,
            name,
            recipe_ingredients (
              id,
              ingredient_id,
              amount,
              unit,
              ingredient:ingredients (
                id,
                name,
                category
              )
            )
          )
        `
        )
        .gte('meal_date', startDate)
        .lte('meal_date', endDate)

      if (mealsError) {
        throw new Error(`Error fetching planned meals: ${mealsError.message}`)
      }

      // 2. Agreguj składniki
      const ingredientMap = new Map<
        number,
        {
          id: number
          name: string
          category: string
          totalAmount: number
          unit: string
        }
      >()

      plannedMeals?.forEach((meal) => {
        const recipe = meal.recipe as any
        if (!recipe?.recipe_ingredients) return

        recipe.recipe_ingredients.forEach((ri: any) => {
          const ingredient = ri.ingredient
          const existing = ingredientMap.get(ingredient.id)

          if (existing) {
            // Agreguj ilość (zakładamy tą samą jednostkę)
            existing.totalAmount += ri.amount
          } else {
            ingredientMap.set(ingredient.id, {
              id: ingredient.id,
              name: ingredient.name,
              category: ingredient.category || 'Inne',
              totalAmount: ri.amount,
              unit: ri.unit,
            })
          }
        })
      })

      // 3. Grupuj po kategoriach
      const categoriesMap = new Map<string, ShoppingListItem[]>()

      ingredientMap.forEach((item) => {
        const shoppingItem: ShoppingListItem = {
          ingredient_id: item.id,
          ingredient_name: item.name,
          ingredient_category: item.category,
          total_amount: item.totalAmount,
          unit: item.unit,
          is_purchased: false, // TODO: Przechowywać stan purchased w LocalStorage/AsyncStorage
        }

        const categoryItems = categoriesMap.get(item.category) || []
        categoryItems.push(shoppingItem)
        categoriesMap.set(item.category, categoryItems)
      })

      // 4. Konwertuj do tablicy
      const result: ShoppingListByCategory[] = []
      categoriesMap.forEach((items, category) => {
        result.push({
          category,
          items: items.sort((a, b) =>
            a.ingredient_name.localeCompare(b.ingredient_name)
          ),
        })
      })

      // Sortuj kategorie alfabetycznie
      return result.sort((a, b) => a.category.localeCompare(b.category))
    },
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minut
  })
}

/**
 * Toggle purchased status dla składnika
 * UWAGA: To będzie działać tylko lokalnie (stan w React)
 * Aby persist, trzeba użyć AsyncStorage lub dodać tabelę w Supabase
 */
export function useTogglePurchased() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ingredientId,
      isPurchased,
      startDate,
      endDate,
    }: {
      ingredientId: number
      isPurchased: boolean
      startDate: string
      endDate: string
    }) => {
      // TODO: Zapisz stan w AsyncStorage lub Supabase
      // Na razie tylko optymistyczny update w cache
      return { ingredientId, isPurchased }
    },
    onMutate: async ({ ingredientId, isPurchased, startDate, endDate }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: shoppingListKeys.byDateRange(startDate, endDate),
      })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ShoppingListByCategory[]>(
        shoppingListKeys.byDateRange(startDate, endDate)
      )

      // Optimistic update
      queryClient.setQueryData<ShoppingListByCategory[]>(
        shoppingListKeys.byDateRange(startDate, endDate),
        (old) => {
          if (!old) return old

          return old.map((category) => ({
            ...category,
            items: category.items.map((item) =>
              item.ingredient_id === ingredientId
                ? { ...item, is_purchased: isPurchased }
                : item
            ),
          }))
        }
      )

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          shoppingListKeys.byDateRange(variables.startDate, variables.endDate),
          context.previousData
        )
      }
      Toast.show({
        type: 'error',
        text1: 'Błąd',
        text2: 'Nie udało się zaktualizować statusu',
      })
    },
  })
}

/**
 * Wyczyść wszystkie oznaczenia "purchased"
 */
export function useClearPurchased() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      startDate,
      endDate,
    }: {
      startDate: string
      endDate: string
    }) => {
      // TODO: Wyczyść stan w AsyncStorage lub Supabase
      return { cleared: true }
    },
    onSuccess: (data, { startDate, endDate }) => {
      // Reset all purchased flags
      queryClient.setQueryData<ShoppingListByCategory[]>(
        shoppingListKeys.byDateRange(startDate, endDate),
        (old) => {
          if (!old) return old

          return old.map((category) => ({
            ...category,
            items: category.items.map((item) => ({
              ...item,
              is_purchased: false,
            })),
          }))
        }
      )

      Toast.show({
        type: 'success',
        text1: 'Lista wyczyszczona',
        text2: 'Wszystkie produkty odznaczone',
      })
    },
  })
}
