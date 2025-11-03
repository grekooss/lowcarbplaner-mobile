/**
 * useProfile Hook
 *
 * Hook do zarządzania profilem użytkownika:
 * - Pobieranie profilu (GET /api/profile/me)
 * - Aktualizacja profilu (PATCH /api/profile/me)
 * - Generowanie nowego planu (POST /api/profile/me/generate-plan)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@src/lib/supabase/client'
import Toast from 'react-native-toast-message'
import type {
  UpdateProfileCommand,
  GeneratePlanResponseDTO,
} from '@src/types/dto.types'
import type { Tables } from '@src/types/database.types'

/**
 * Query key dla profilu użytkownika
 */
export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
}

/**
 * Hook do pobierania profilu zalogowanego użytkownika
 *
 * @returns Query z danymi profilu użytkownika
 *
 * @example
 * ```tsx
 * function ProfileScreen() {
 *   const { data: profile, isLoading, error } = useProfile()
 *
 *   if (isLoading) return <Loading />
 *   if (error) return <Error />
 *
 *   return <ProfileForm profile={profile} />
 * }
 * ```
 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: async (): Promise<Tables<'profiles'>> => {
      // Pobierz aktualną sesję użytkownika
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('Nie jesteś zalogowany')
      }

      // Pobierz profil użytkownika z bazy
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw new Error(`Błąd pobierania profilu: ${error.message}`)
      }

      if (!data) {
        throw new Error('Profil nie istnieje')
      }

      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minut
    retry: 1,
  })
}

/**
 * Hook do aktualizacji profilu użytkownika
 *
 * @returns Mutation do aktualizacji profilu
 *
 * @example
 * ```tsx
 * function ProfileForm() {
 *   const updateProfile = useUpdateProfile()
 *
 *   const handleSubmit = async (data: UpdateProfileCommand) => {
 *     await updateProfile.mutateAsync(data)
 *   }
 * }
 * ```
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: UpdateProfileCommand
    ): Promise<Tables<'profiles'>> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Nie jesteś zalogowany')
      }

      // Aktualizuj profil
      const { data: updated, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Błąd aktualizacji profilu: ${error.message}`)
      }

      return updated
    },
    onSuccess: (data) => {
      // Zaktualizuj cache
      queryClient.setQueryData(profileKeys.me(), data)

      Toast.show({
        type: 'success',
        text1: 'Profil zaktualizowany',
        text2: 'Twoje dane zostały pomyślnie zapisane',
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
 * Hook do generowania nowego planu posiłków
 *
 * @returns Mutation do generowania planu
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const generatePlan = useGeneratePlan()
 *
 *   const handleGenerate = async () => {
 *     await generatePlan.mutateAsync()
 *   }
 * }
 * ```
 */
export function useGeneratePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<GeneratePlanResponseDTO> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Nie jesteś zalogowany')
      }

      // TODO: Wywołaj funkcję RPC do generowania planu
      // Note: Wymaga utworzenia RPC function w Supabase Database
      // const { data, error } = await supabase.rpc('generate_meal_plan', {
      //   user_id: user.id,
      // })
      //
      // if (error) {
      //   throw new Error(`Błąd generowania planu: ${error.message}`)
      // }

      // Temporary mock response
      return {
        status: 'success',
        message:
          'Funkcja generowania planu wymaga implementacji RPC w Supabase',
        generated_days: 0,
      }
    },
    onSuccess: (data) => {
      // Invalidate queries związane z posiłkami
      queryClient.invalidateQueries({ queryKey: ['planned-meals'] })

      Toast.show({
        type: 'success',
        text1: 'Plan wygenerowany',
        text2: data.message,
        visibilityTime: 4000,
      })
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Błąd generowania planu',
        text2: error.message,
      })
    },
  })
}
