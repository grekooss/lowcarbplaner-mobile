import React, { createContext, useContext, useState, ReactNode } from 'react'

// Typy zgodne z bazą danych
type Gender = 'male' | 'female'
type ActivityLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
type Goal = 'weight_loss' | 'weight_maintenance'

interface OnboardingData {
  // Step 1
  gender: Gender | null
  age: number | null
  weight_kg: number | null
  height_cm: number | null

  // Step 2
  activity_level: ActivityLevel | null
  goal: Goal | null
  weight_loss_rate_kg_week: number | null
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  clearData: () => void
}

const initialData: OnboardingData = {
  gender: null,
  age: null,
  weight_kg: null,
  height_cm: null,
  activity_level: null,
  goal: null,
  weight_loss_rate_kg_week: null,
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData)

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const clearData = () => {
    setData(initialData)
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData, clearData }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
