/**
 * useRecipes Hook
 *
 * Zarządzanie przepisami (recipes):
 * - Pobieranie listy przepisów z filtrowaniem
 * - Pobieranie szczegółów przepisu
 * - Filtrowanie po kategorii, makro, nazwie
 * - Paginacja i infinite scroll
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@src/lib/supabase/client'
import type { Tables } from '@src/types/database.types'

// ==================== QUERY KEYS ====================

export const recipesKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipesKeys.all, 'list'] as const,
  list: (filters: RecipeFilters) => [...recipesKeys.lists(), filters] as const,
  details: () => [...recipesKeys.all, 'detail'] as const,
  detail: (id: number) => [...recipesKeys.details(), id] as const,
  categories: () => [...recipesKeys.all, 'categories'] as const,
}

// ==================== TYPES ====================

export interface RecipeFilters {
  search?: string
  category?: string
  maxCalories?: number
  maxCarbs?: number
  minProtein?: number
  isLowCarb?: boolean
}

export interface RecipeWithDetails extends Tables<'recipes'> {
  recipe_ingredients: {
    id: number
    ingredient_id: number
    amount: number
    unit: string
    ingredient: {
      id: number
      name: string
      category: string
    }
  }[]
}

// ==================== HOOKS ====================

/**
 * Pobiera listę przepisów z filtrowaniem
 */
export function useRecipes(filters: RecipeFilters = {}) {
  return useQuery({
    queryKey: recipesKeys.list(filters),
    queryFn: async (): Promise<Tables<'recipes'>[]> => {
      let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

      // Search by name
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      // Filter by category
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Filter by max calories
      if (filters.maxCalories) {
        query = query.lte('total_calories', filters.maxCalories)
      }

      // Filter by max carbs
      if (filters.maxCarbs) {
        query = query.lte('total_carbs_g', filters.maxCarbs)
      }

      // Filter by min protein
      if (filters.minProtein) {
        query = query.gte('total_protein_g', filters.minProtein)
      }

      // Low carb filter (< 20g carbs)
      if (filters.isLowCarb) {
        query = query.lt('total_carbs_g', 20)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Error fetching recipes: ${error.message}`)
      }

      return data || []
    },
    staleTime: 10 * 60 * 1000, // 10 minut
  })
}

/**
 * Pobiera szczegóły przepisu ze składnikami
 */
export function useRecipeDetails(recipeId: number) {
  return useQuery({
    queryKey: recipesKeys.detail(recipeId),
    queryFn: async (): Promise<RecipeWithDetails> => {
      const { data, error } = await supabase
        .from('recipes')
        .select(
          `
          *,
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
        `
        )
        .eq('id', recipeId)
        .single()

      if (error) {
        throw new Error(`Error fetching recipe details: ${error.message}`)
      }

      return data as RecipeWithDetails
    },
    enabled: !!recipeId,
    staleTime: 15 * 60 * 1000, // 15 minut
  })
}

/**
 * Pobiera listę dostępnych kategorii przepisów
 */
export function useRecipeCategories() {
  return useQuery({
    queryKey: recipesKeys.categories(),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('recipes')
        .select('category')
        .not('category', 'is', null)

      if (error) {
        throw new Error(`Error fetching categories: ${error.message}`)
      }

      // Zwróć unikalne kategorie
      const uniqueCategories = [
        ...new Set(data.map((r) => r.category).filter(Boolean)),
      ]
      return uniqueCategories as string[]
    },
    staleTime: 60 * 60 * 1000, // 1 godzina (kategorie się rzadko zmieniają)
  })
}

/**
 * Infinite scroll dla przepisów (opcjonalnie)
 */
export function useInfiniteRecipes(filters: RecipeFilters = {}, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: recipesKeys.list(filters),
    queryFn: async ({ pageParam = 0 }): Promise<Tables<'recipes'>[]> => {
      let query = supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + pageSize - 1)

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.maxCalories) {
        query = query.lte('total_calories', filters.maxCalories)
      }
      if (filters.maxCarbs) {
        query = query.lte('total_carbs_g', filters.maxCarbs)
      }
      if (filters.minProtein) {
        query = query.gte('total_protein_g', filters.minProtein)
      }
      if (filters.isLowCarb) {
        query = query.lt('total_carbs_g', 20)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Error fetching recipes: ${error.message}`)
      }

      return data || []
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length < pageSize) {
        return undefined // Brak więcej danych
      }
      return lastPageParam + pageSize
    },
    staleTime: 10 * 60 * 1000,
  })
}
