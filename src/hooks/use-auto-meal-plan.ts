/**
 * useAutoMealPlan Hook
 *
 * Automatyczne zarządzanie planem posiłków:
 * - Czyszczenie starych planów (dni < dzisiaj) przy każdym logowaniu
 * - Automatyczna detekcja i generowanie brakujących dni
 * - Silent execution (nie pokazuje toastów, działa w tle)
 *
 * Hook uruchamia się automatycznie gdy użytkownik jest zalogowany
 * i ma skonfigurowany profil.
 */

import { useEffect, useRef } from 'react'
import { useAuth } from '@/src/hooks/useAuth'
import { useProfile } from '@/src/hooks/api/use-profile'
import {
  cleanupOldMealPlans,
  findMissingDays,
  generateDayPlan,
} from '@/src/services/meal-plan-generator'
import { supabase } from '@/src/lib/supabase/client'

/**
 * Hook do automatycznego zarządzania planem posiłków
 *
 * Uruchamia się raz przy montowaniu gdy użytkownik jest zalogowany
 * i ma skonfigurowany profil.
 *
 * @example
 * ```tsx
 * function App() {
 *   useAutoMealPlan()
 *
 *   return <AppContent />
 * }
 * ```
 */
export function useAutoMealPlan() {
  const { user } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const hasRunRef = useRef(false)

  useEffect(() => {
    // Skip jeśli nie ma użytkownika, profil się ładuje, lub już wykonano
    if (!user || profileLoading || !profile || hasRunRef.current) {
      return
    }

    // Oznacz jako wykonane (prevent multiple runs)
    hasRunRef.current = true

    // Wykonaj cleanup i auto-generation
    const autoManageMealPlan = async () => {
      try {
        console.log('🔄 Auto Meal Plan: Rozpoczynam sprawdzanie planu...')

        // 1. Cleanup starych planów
        try {
          const deletedCount = await cleanupOldMealPlans(user.id)
          if (deletedCount > 0) {
            console.log(
              `🧹 Auto Meal Plan: Usunięto ${deletedCount} starych posiłków`
            )
          }
        } catch (cleanupError) {
          console.warn(
            '⚠️  Auto Meal Plan: Błąd czyszczenia (nie krytyczny):',
            cleanupError
          )
        }

        // 2. Sprawdź czy są brakujące dni
        const formatLocalDate = (date: Date): string => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const dates: string[] = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          dates.push(formatLocalDate(date))
        }

        const missingDays = await findMissingDays(user.id, dates)

        // 3. Jeśli brakuje dni, wygeneruj plan
        if (missingDays.length > 0) {
          console.log(
            `📅 Auto Meal Plan: Brakuje ${missingDays.length} dni, generuję plan...`
          )

          const plannedMeals = []

          for (const date of missingDays) {
            const dayPlan = await generateDayPlan(user.id, date, {
              target_calories: profile.target_calories,
              target_protein_g: profile.target_protein_g,
              target_carbs_g: profile.target_carbs_g,
              target_fats_g: profile.target_fats_g,
            })
            plannedMeals.push(...dayPlan)
          }

          // 4. Batch insert do bazy
          const { error: insertError } = await supabase
            .from('planned_meals')
            .insert(plannedMeals)

          if (insertError) {
            console.error('❌ Auto Meal Plan: Błąd zapisu:', insertError)
            return
          }

          console.log(
            `✅ Auto Meal Plan: Wygenerowano ${plannedMeals.length} posiłków dla ${missingDays.length} dni`
          )
        } else {
          console.log('✅ Auto Meal Plan: Plan kompletny, nie trzeba generować')
        }
      } catch (error) {
        console.error('❌ Auto Meal Plan: Nieoczekiwany błąd:', error)
      }
    }

    // Uruchom z małym opóźnieniem aby nie blokować UI
    const timeoutId = setTimeout(() => {
      autoManageMealPlan()
    }, 1000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [user, profile, profileLoading])
}
