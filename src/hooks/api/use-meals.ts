import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateMealInput,
  Meal,
  MealsResponse,
  UpdateMealInput,
} from '@src/types/meal'

// TODO: Zamień na swój endpoint API
const API_BASE_URL = 'https://api.example.com'

/**
 * Query Keys - centralne miejsce dla kluczy query
 */
export const mealKeys = {
  all: ['meals'] as const,
  lists: () => [...mealKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...mealKeys.lists(), filters] as const,
  details: () => [...mealKeys.all, 'detail'] as const,
  detail: (id: string) => [...mealKeys.details(), id] as const,
}

/**
 * API Functions
 */
async function fetchMeals(): Promise<Meal[]> {
  const response = await fetch(`${API_BASE_URL}/meals`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch meals')
  }

  const data: MealsResponse = await response.json()
  return data.meals
}

async function fetchMealById(id: string): Promise<Meal> {
  const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch meal ${id}`)
  }

  return response.json()
}

async function createMeal(input: CreateMealInput): Promise<Meal> {
  const response = await fetch(`${API_BASE_URL}/meals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to create meal')
  }

  return response.json()
}

async function updateMeal(input: UpdateMealInput): Promise<Meal> {
  const { id, ...data } = input
  const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to update meal ${id}`)
  }

  return response.json()
}

async function deleteMeal(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/meals/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete meal ${id}`)
  }
}

/**
 * Hook do pobierania listy posiłków
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMeals()
 * ```
 */
export function useMeals() {
  return useQuery({
    queryKey: mealKeys.lists(),
    queryFn: fetchMeals,
  })
}

/**
 * Hook do pobierania pojedynczego posiłku
 *
 * @example
 * ```tsx
 * const { data: meal, isLoading } = useMeal(mealId)
 * ```
 */
export function useMeal(id: string) {
  return useQuery({
    queryKey: mealKeys.detail(id),
    queryFn: () => fetchMealById(id),
    enabled: !!id, // Tylko jeśli id istnieje
  })
}

/**
 * Hook do tworzenia nowego posiłku
 *
 * @example
 * ```tsx
 * const createMealMutation = useCreateMeal()
 *
 * const handleCreate = () => {
 *   createMealMutation.mutate({
 *     name: 'Kurczak z warzywami',
 *     carbs: 15,
 *     protein: 35,
 *     fat: 10,
 *     calories: 290
 *   })
 * }
 * ```
 */
export function useCreateMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMeal,
    onSuccess: () => {
      // Invalidate i refetch listy posiłków po utworzeniu
      queryClient.invalidateQueries({ queryKey: mealKeys.lists() })
    },
  })
}

/**
 * Hook do aktualizacji posiłku
 */
export function useUpdateMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMeal,
    onSuccess: (data) => {
      // Invalidate szczegóły i listę
      queryClient.invalidateQueries({ queryKey: mealKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: mealKeys.lists() })
    },
  })
}

/**
 * Hook do usuwania posiłku
 */
export function useDeleteMeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMeal,
    onSuccess: () => {
      // Invalidate listę po usunięciu
      queryClient.invalidateQueries({ queryKey: mealKeys.lists() })
    },
  })
}
