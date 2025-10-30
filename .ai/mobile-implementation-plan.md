# LowCarb Planer Mobile - Plan Implementacji

> Analiza projektu WEB i kompletny plan przeniesienia na React Native (Expo)

---

## 📊 ANALIZA PROJEKTU WEB

### 🎯 **Architektura Aplikacji**

**Tech Stack:**

- **Framework:** Next.js 15.5.4 (App Router, React 19)
- **Styling:** Tailwind CSS 4 + Radix UI
- **State Management:** Zustand + TanStack Query
- **Backend:** Supabase (Auth + PostgreSQL)
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest + Playwright

### 🗄️ **Model Danych (Database Schema)**

```
📦 Główne tabele:
├── profiles (użytkownicy + cele makro)
├── recipes (przepisy)
├── ingredients (składniki)
├── recipe_ingredients (składniki przepisu)
├── planned_meals (zaplanowane posiłki)
├── ingredient_unit_conversions (konwersje jednostek)
└── feedback (opinie użytkowników)

🔑 Kluczowe enumy:
├── meal_type_enum: breakfast | lunch | dinner
├── goal_enum: weight_loss | weight_maintenance
├── activity_level_enum: very_low → very_high
├── difficulty_level_enum: easy | medium | hard
└── ingredient_category_enum: vegetables, meat, dairy, etc.
```

### 🏗️ **Struktura Funkcjonalności**

#### **1. Autentykacja & Onboarding**

- Email/hasło przez Supabase Auth
- Onboarding: zbiera dane (płeć, wiek, waga, wzrost, cel, aktywność)
- Oblicza cele makro (kalorie, białko, węgle, tłuszcze)
- Disclaimer do akceptacji

#### **2. Dashboard (Główny Widok)**

```
Components:
├── CalendarStrip - pasek z datami (7 dni)
├── MacroProgressSection - paski postępu makro
├── MealsList - lista 3 posiłków (śniadanie, obiad, kolacja)
├── MealCard - karta pojedynczego posiłku
├── IngredientEditor - edycja ilości składników
└── EmptyState - stan pusty gdy brak danych
```

**Funkcje:**

- ✅ Wybór dnia z kalendarza
- ✅ Paski postępu: kalorie, białko, węgle, tłuszcze
- ✅ Oznaczanie posiłku jako zjedzony
- ✅ Edycja ilości składników w posiłku
- ✅ Wymiana przepisu na inny
- ✅ Auto-generacja planu gdy brak danych

#### **3. Meal Plan (Plan Tygodniowy)**

```
Components:
├── WeekTable - tabela 7 dni × 3 posiłki
├── DayCard - karta pojedynczego dnia
├── MealCard - mini karta posiłku
├── RecipeModal - modal z detalami przepisu
└── ReplacementsModal - modal z zamiennikami przepisu
```

**Funkcje:**

- ✅ Widok tygodniowy (7 dni)
- ✅ Podgląd przepisu (składniki, instrukcje)
- ✅ Wymiana przepisu z sugestiami
- ✅ Nawigacja między tygodniami

#### **4. Recipes (Przepisy)**

- Lista wszystkich przepisów
- Filtry: typ posiłku, trudność, tagi
- Sortowanie: rating, kalorie, nazwa
- Szczegóły przepisu

#### **5. Shopping List (Lista Zakupów)**

- Generowana z posiłków na wybrany zakres dat
- Grupowanie po kategoriach składników
- Zaznaczanie kupionych produktów (localStorage)

#### **6. Profile**

- Edycja danych użytkownika
- Aktualizacja celów makro
- Generowanie nowego planu

### 🧮 **Kluczowa Logika Biznesowa**

#### **Meal Plan Generator**

```typescript
// meal-plan-generator.ts - 1128 linii!

Algorytm:
1. Dla każdego dnia (7 dni)
2. Dla każdego typu posiłku (3 × dzień)
3. Oblicz przedział kaloryczny: (target_calories / 3) ± 15%
4. Znajdź przepisy w przedziale
5. Losuj przepis (unikaj duplikatów w tym samym dniu)
6. OPTYMALIZACJA:
   - Sprawdź kalorie dnia (≤100% → OK, >100% → redukcja)
   - Sprawdź makro (>105% → redukcja składnika)
   - Max zmiana składnika: 20%
   - Zaokrąglenie do 5g

Wynik: 21 posiłków z ingredient_overrides (auto-adjusted)
```

#### **Nutrition Calculator**

- Przelicza wartości odżywcze na podstawie ilości składnika
- Uwzględnia `ingredient_overrides`
- Konwersje jednostek (g, ml, sztuki)

#### **Shopping List Generator**

- Agreguje składniki z planned_meals w zakresie dat
- Grupuje po kategoriach
- Sumuje ilości tego samego składnika

---

## 🚀 **PLAN IMPLEMENTACJI NA MOBILE**

### **Faza 1: Fundament (Tydzień 1-2)**

#### 1.1 Setup Projektu Mobile

```bash
✅ Expo Router (już masz)
✅ React Native Unistyles (już masz)
✅ TypeScript
✅ ESLint + Prettier + Husky (już masz)

TODO:
├── Supabase Client (@supabase/supabase-js)
├── TanStack Query (@tanstack/react-query)
├── React Hook Form + Zod
├── Zustand (opcjonalnie, dla offline state)
└── AsyncStorage (dla cache)
```

#### 1.2 Kopiuj Typy z WEB

```
📁 src/types/
├── database.types.ts ✅ (skopiuj 1:1 z WEB)
├── dto.types.ts ✅ (skopiuj 1:1 z WEB)
└── viewmodels.ts ✅ (skopiuj 1:1 z WEB)
```

#### 1.3 Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

#### 1.4 TanStack Query Provider

```typescript
// providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

### **Faza 2: Autentykacja & Onboarding (Tydzień 3)**

#### 2.1 Auth Screens

```
📁 app/(public)/auth/
├── login.tsx
├── register.tsx
├── forgot-password.tsx
└── reset-password.tsx

Komponenty:
├── AuthForm (wspólny komponent)
├── EmailInput + PasswordInput
└── AuthButton
```

**Hooki:**

```typescript
// hooks/useAuth.ts
export function useLogin()
export function useRegister()
export function useForgotPassword()
export function useResetPassword()
export function useLogout()
export function useSession() // Supabase session
```

#### 2.2 Onboarding Flow

```
📁 app/(public)/onboarding/
├── index.tsx (krok 1: płeć, wiek, waga, wzrost)
├── activity.tsx (krok 2: poziom aktywności)
├── goal.tsx (krok 3: cel + tempo)
├── disclaimer.tsx (krok 4: regulamin)
└── summary.tsx (krok 5: podsumowanie celów makro)

Komponenty:
├── OnboardingProgress (progress bar)
├── StepIndicator
├── RadioGroup (gender, activity, goal)
├── NumberInput (age, weight, height)
└── Button (primary, secondary)
```

**Hooki:**

```typescript
// hooks/useOnboarding.ts
export function useOnboardingForm() // Zustand store dla multi-step
export function useCreateProfile() // Mutacja POST /api/profile
```

---

### **Faza 3: Dashboard (Tydzień 4-5)**

#### 3.1 Layout z Navigation

```
📁 app/(app)/
├── _layout.tsx (Tab Navigator)
├── (dashboard)/
│   └── index.tsx
├── meal-plan.tsx
├── recipes.tsx
├── shopping-list.tsx
└── profile.tsx

Bottom Tabs:
├── 🏠 Dashboard
├── 📅 Plan
├── 🍳 Przepisy
├── 🛒 Lista
└── 👤 Profil
```

#### 3.2 Dashboard Components

```
📁 src/components/dashboard/
├── CalendarStrip.tsx
│   └── Horizontal ScrollView z datami (7 dni)
│
├── MacroProgressCard.tsx
│   └── Card z 4 paskami postępu
│       ├── Calories (okrągły progress?)
│       ├── Protein
│       ├── Carbs
│       └── Fats
│
├── MealsList.tsx
│   └── Lista 3 posiłków
│
├── MealCard.tsx
│   ├── Image (recipe.image_url)
│   ├── Name + type badge
│   ├── Makro (kcal, P, C, F)
│   ├── Checkbox (is_eaten)
│   └── Actions: Edit, Swap
│
├── IngredientModal.tsx
│   └── Bottom Sheet z edycją składników
│       ├── Lista IngredientRow
│       └── Slider lub NumberInput dla ilości
│
└── EmptyState.tsx
    └── Button "Generuj plan"
```

**Hooki:**

```typescript
// hooks/usePlannedMeals.ts
export function usePlannedMeals(date: string) // Query GET /api/planned-meals?start_date=X&end_date=X
export function useToggleMealEaten(mealId: number) // Mutation PATCH /api/planned-meals/:id/eaten
export function useUpdateIngredient(mealId: number, ingredientId: number) // Mutation PATCH /api/planned-meals/:id/ingredients/:ingredientId
export function useSwapMeal(mealId: number) // Mutation POST /api/planned-meals/:id/swap
export function useGeneratePlan() // Mutation POST /api/profile/me/generate-plan

// hooks/useDailyMacros.ts
export function useDailyMacros(meals: PlannedMealDTO[], targetMacros) // Oblicza consumed vs target
```

---

### **Faza 4: Meal Plan (Tydzień 6)**

#### 4.1 Week View

```
📁 src/components/meal-plan/
├── WeekHeader.tsx
│   └── Nawigacja: < Poprzedni | Tydzień 20-26 Paź | Następny >
│
├── DayCard.tsx
│   ├── Data + dzień tygodnia
│   ├── 3× MiniMealCard
│   └── Suma makro na dzień
│
└── MiniMealCard.tsx
    ├── Mini image
    ├── Recipe name
    └── Kalorie

Interakcje:
├── Tap na DayCard → Przejdź do Dashboard (data)
├── Tap na MiniMealCard → RecipeModal
└── Long press → ReplacementsModal
```

**Hooki:**

```typescript
// hooks/useWeekMeals.ts
export function useWeekMeals(startDate: string) // Query dla 7 dni
export function useReplacementRecipes(mealId: number) // Query GET /api/planned-meals/:id/replacements
```

---

### **Faza 5: Recipes & Shopping List (Tydzień 7)**

#### 5.1 Recipes Screen

```
📁 src/components/recipes/
├── RecipeList.tsx (FlatList)
├── RecipeCard.tsx (horizontal card)
├── RecipeFilters.tsx (modal z filtrami)
├── RecipeModal.tsx (full-screen modal)
│   ├── Hero Image
│   ├── Nazwa + rating + difficulty
│   ├── Makro (kcal, P, C, F)
│   ├── Ingredients list
│   └── Instructions (kroki)
└── SearchBar.tsx
```

**Hooki:**

```typescript
// hooks/useRecipes.ts
export function useRecipes(filters?: RecipeFilters) // Query GET /api/recipes
export function useRecipeDetails(recipeId: number) // Query GET /api/recipes/:id
```

#### 5.2 Shopping List Screen

```
📁 src/components/shopping-list/
├── DateRangeSelector.tsx
│   └── From: [date picker] To: [date picker]
│
├── CategorySection.tsx
│   ├── Category header (collapsible)
│   └── IngredientRow[]
│
└── IngredientRow.tsx
    ├── Checkbox (is_purchased - local state)
    ├── Name
    └── Amount + unit
```

**Hooki:**

```typescript
// hooks/useShoppingList.ts
export function useShoppingList(startDate: string, endDate: string) // Query GET /api/shopping-list?start_date=X&end_date=X
export function useShoppingListState() // Zustand store dla checkboxów (localStorage)
```

---

### **Faza 6: Profile & Settings (Tydzień 8)**

#### 6.1 Profile Screen

```
📁 src/components/profile/
├── ProfileForm.tsx
│   ├── Email (disabled)
│   ├── Gender, Age, Weight, Height
│   ├── Activity Level
│   ├── Goal + Rate
│   └── Button "Zapisz zmiany"
│
├── MacroTargetsCard.tsx
│   └── Wyświetla aktualne cele makro
│
└── DangerZone.tsx
    ├── Button "Generuj nowy plan"
    └── Button "Wyloguj"
```

**Hooki:**

```typescript
// hooks/useProfile.ts
export function useProfile() // Query GET /api/profile/me
export function useUpdateProfile() // Mutation PATCH /api/profile/me
export function useGenerateNewPlan() // Mutation POST /api/profile/me/generate-plan
```

---

### **Faza 7: Polish & Testing (Tydzień 9-10)**

#### 7.1 UX Enhancements

- Loading states (Skeleton screens)
- Error states (Retry buttons)
- Empty states (Illustrations)
- Success toasts (react-native-toast-message)
- Animations (react-native-reanimated)
- Haptic feedback
- Pull-to-refresh
- Infinite scroll (recipes)

#### 7.2 Offline Support

- AsyncStorage cache dla TanStack Query
- Optimistic updates
- Sync strategy

#### 7.3 Testing

- Unit tests (Vitest)
- Component tests (React Native Testing Library)
- E2E tests (Detox?)

---

## 📦 **Co Możesz Bezpośrednio Przenieść z WEB:**

### ✅ **100% Reusable (Zero zmian)**

```typescript
src/types/database.types.ts
src/types/dto.types.ts
src/types/viewmodels.ts
src/services/nutrition-calculator.ts (jeśli client-side logic)
src/services/shopping-list.ts (jeśli client-side logic)
```

### ⚠️ **Wymaga Adaptacji (React Native API)**

```typescript
src/hooks/*.ts
├── useAuth → AsyncStorage zamiast cookies
├── usePlannedMeals → @tanstack/react-query (bez zmian)
├── useAutoGenerateMealPlan → Server Action → API endpoint
└── wszystkie inne hooki (głównie bez zmian)

src/services/meal-plan-generator.ts
└── Tylko jeśli będziesz generować na mobile (raczej nie - zostaw na backend)
```

### ❌ **Nie Przeniesiesz (Web-only)**

```typescript
middleware.ts (Next.js Auth middleware)
lib/supabase/server.ts (Server-side Supabase)
lib/actions/* (Next.js Server Actions)
app/api/* (API Routes - masz Supabase direct)
```

---

## 🎯 **Kluczowe Różnice: Web vs Mobile**

| Aspekt            | Web (Next.js)               | Mobile (Expo)                          |
| ----------------- | --------------------------- | -------------------------------------- |
| **Routing**       | App Router                  | Expo Router (file-based)               |
| **Styling**       | Tailwind CSS                | React Native Unistyles                 |
| **Auth**          | Server-side cookies         | AsyncStorage + session                 |
| **Data Fetching** | Server Components + Actions | TanStack Query + Supabase client       |
| **Forms**         | React Hook Form             | React Hook Form (bez zmian)            |
| **State**         | Zustand                     | Zustand (bez zmian)                    |
| **Images**        | Next Image                  | expo-image                             |
| **Navigation**    | Link                        | Expo Router Link                       |
| **Modals**        | Radix Dialog                | React Native Modal / Bottom Sheet      |
| **Date Picker**   | HTML input                  | @react-native-community/datetimepicker |

---

## 💡 **Rekomendacje**

### 1. **Start Simple, Iterate Fast**

Zacznij od MVP:

- Auth + Onboarding + Dashboard
- Potem dopiero: Meal Plan, Recipes, Shopping List

### 2. **Kopiuj Typy i Logikę**

- Typy: 1:1 copy
- Hooki: Większość bez zmian (zmień tylko Supabase client)
- Services: Jeśli client-side, kopiuj

### 3. **Use Expo Ecosystem**

- `expo-image` zamiast `next/image`
- `expo-router` zamiast Next.js router
- `@react-native-async-storage/async-storage`
- `react-native-reanimated` dla animacji

### 4. **Consider React Native Paper lub NativeBase**

Dla szybszego UI development (alternatywa dla Radix UI):

- React Native Paper (Material Design)
- NativeBase (Universal components)
- Lub build custom z Unistyles (masz już)

### 5. **Backend Strategy**

Masz 3 opcje:

1. **Direct Supabase** (najszybsze) - już masz w WEB
2. **API Layer** - jeśli chcesz więcej kontroli
3. **GraphQL** - jeśli planujesz scaling

Polecam opcję 1 (Direct Supabase) - używasz już @supabase/supabase-js.

---

## 🚀 **Następne Kroki**

Możliwe kierunki:

1. **Wygenerować strukturę folderów** dla mobile
2. **Stworzyć starter files** (Supabase client, Query Provider, Auth hooks)
3. **Zaprojektować komponenty Dashboard** (CalendarStrip, MealCard, MacroProgress)
4. **Napisać hooki do API** (usePlannedMeals, useToggleMealEaten, etc.)
5. **Zaplanować design system** w Unistyles (colors, spacing, typography)

---

## 📋 **Timeline Summary**

| Tydzień | Faza               | Deliverables                             |
| ------- | ------------------ | ---------------------------------------- |
| 1-2     | Fundament          | Setup, Typy, Supabase, TanStack Query    |
| 3       | Auth & Onboarding  | Login, Register, 5-step Onboarding       |
| 4-5     | Dashboard          | Calendar, Meals, Makro Progress, Actions |
| 6       | Meal Plan          | Week View, Recipe Details, Swaps         |
| 7       | Recipes & Shopping | List, Filters, Shopping List             |
| 8       | Profile            | Settings, Edit Profile, Generate Plan    |
| 9-10    | Polish             | Animations, Offline, Testing             |

**Szacowany czas: 10 tygodni do MVP** 🎯
