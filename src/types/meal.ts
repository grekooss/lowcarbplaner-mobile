/**
 * Typy dla systemu posiłków (meals)
 */

export interface Meal {
  id: string
  name: string
  description?: string
  carbs: number // gramy węglowodanów
  protein: number // gramy białka
  fat: number // gramy tłuszczu
  calories: number // kalorie
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMealInput {
  name: string
  description?: string
  carbs: number
  protein: number
  fat: number
  calories: number
  imageUrl?: string
}

export interface UpdateMealInput extends Partial<CreateMealInput> {
  id: string
}

export interface MealsResponse {
  meals: Meal[]
  total: number
  page: number
  pageSize: number
}
