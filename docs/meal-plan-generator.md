# Generator Planu Posiłków - Dokumentacja

## Przegląd

Generator planu posiłków automatycznie tworzy spersonalizowany 7-dniowy plan posiłków (21 meals) zgodny z celami żywieniowymi użytkownika. System został przeportowany z wersji webowej i zaimplementowany jako natywny serwis mobilny.

## Architektura

### Komponenty systemu

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (React Native)                  │
│                                                              │
│  • app/(tabs)/meal-plan.tsx                                 │
│  • components/meal-plan/auto-generate-prompt.tsx           │
│  • components/meal-plan/day-card.tsx                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Hooks Layer (React Query)                │
│                                                              │
│  • hooks/api/use-planned-meals.ts                          │
│    - useGenerateMealPlan()                                  │
│    - usePlannedMealsRange()                                 │
│    - useToggleMealEaten()                                   │
│    - useSwapMeal()                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                Service Layer (Business Logic)               │
│                                                              │
│  • services/meal-plan-generator.ts                         │
│    - generateWeeklyPlan()                                   │
│    - generateDayPlan()                                      │
│    - optimizeDayPlan()                                      │
│    - selectRecipeForMeal()                                  │
│    - cleanupOldMealPlans()                                  │
│    - findMissingDays()                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (Supabase)                      │
│                                                              │
│  • planned_meals table                                      │
│  • recipes table                                            │
│  • recipe_ingredients table                                 │
│  • profiles table                                           │
└─────────────────────────────────────────────────────────────┘
```

## Algorytm Generowania

### 1. Proces wysokopoziomowy

```typescript
generateWeeklyPlan(userProfile, startDate?)
  ↓
  for each day (7 days):
    generateDayPlan(userId, date, nutritionTargets)
      ↓
      for each meal type (breakfast, lunch, dinner):
        selectRecipeForMeal(mealType, calorieRange, usedRecipeIds)
      ↓
      optimizeDayPlan(dayPlan, selectedRecipes, targets)
```

### 2. Dobór przepisów

**Kryteria selekcji:**

- Typ posiłku: `meal_types` zawiera odpowiedni typ (breakfast/lunch/dinner)
- Kalorie: w przedziale `target ± 15%`
- Różnorodność: brak powtórzeń przepisów w tym samym dniu

**Przykład:**

```
User target: 1800 kcal/day
Per meal: 600 kcal (1800 ÷ 3)
Range: 510-690 kcal (600 ± 15%)
```

### 3. Algorytm optymalizacji

**Priorytet 1: Kalorie (ZAWSZE ≤100%)**

```typescript
if (dayCalories > targetCalories) {
  // Znajdź składnik z największą liczbą kalorii
  // Zmniejsz jego ilość (max 20%)
  // Zaokrąglij do wielokrotności 5g
}
```

**Priorytet 2: Makroskładniki (>105%)**

```typescript
if (protein_g > target_protein_g * 1.05) {
  // Znajdź składnik z największą ilością białka
  // Zmniejsz jego ilość (max 20%)
  // Zapisz w ingredient_overrides
}
```

**Parametry algorytmu:**

- `CALORIE_TOLERANCE = 0.15` (±15% dla pojedynczego posiłku)
- `MACRO_SURPLUS_THRESHOLD_PERCENT = 1.05` (optymalizuj gdy >105%)
- `MAX_INGREDIENT_CHANGE_PERCENT = 0.2` (max 20% redukcji składnika)
- `INGREDIENT_ROUNDING_STEP = 5` (zaokrąglanie do 5g)

### 4. Struktura nadpisań składników

```json
{
  "ingredient_overrides": [
    {
      "ingredient_id": 12,
      "new_amount": 150,
      "auto_adjusted": true
    }
  ]
}
```

- `auto_adjusted: true` = zmiana automatyczna przez algorytm
- `auto_adjusted: false/undefined` = zmiana manualna przez użytkownika

## API

### Hook: `useGenerateMealPlan()`

**Proces wykonania:**

```typescript
1. Weryfikacja użytkownika (auth)
2. Pobranie profilu użytkownika (target_calories, macros)
3. Czyszczenie starych planów (dni < dzisiaj)
4. Identyfikacja brakujących dni (findMissingDays)
5. Generowanie planu dla brakujących dni
6. Batch insert do bazy danych
7. Invalidate queries i pokazanie toasta
```

**Użycie:**

```tsx
function MealPlanScreen() {
  const generatePlanMutation = useGenerateMealPlan()

  const handleGenerate = () => {
    generatePlanMutation.mutate()
  }

  return (
    <AutoGeneratePrompt
      missingCount={missingCount}
      onGenerate={handleGenerate}
    />
  )
}
```

**Zwracane dane:**

```typescript
{
  status: 'success',
  generated_count: 21,      // liczba wygenerowanych posiłków
  generated_days: 7         // liczba dni
}
```

### Hook: `usePlannedMealsRange(startDate, endDate)`

**Pobiera zaplanowane posiłki dla zakresu dat.**

```tsx
const { startDate, endDate } = getCurrentWeekRange()
const { data: meals, isLoading } = usePlannedMealsRange(startDate, endDate)
```

**Zwraca:** `PlannedMealDTO[]`

### Hook: `useToggleMealEaten()`

**Oznacza posiłek jako zjedzony/niezjedzony.**

```tsx
const toggleMutation = useToggleMealEaten()

toggleMutation.mutate({
  mealId: 123,
  isEaten: true,
})
```

### Hook: `useSwapMeal()`

**Wymienia przepis w posiłku.**

```tsx
const swapMutation = useSwapMeal()

swapMutation.mutate({
  mealId: 123,
  newRecipeId: 456,
})
```

**Walidacja:**

- Nowy przepis musi pasować do `meal_type`
- Różnica kaloryczna ≤15%

## Serwisy

### `generateWeeklyPlan(userProfile, startDate?)`

Generuje kompletny 7-dniowy plan (21 posiłków).

**Parametry:**

```typescript
userProfile: {
  id: string
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fats_g: number
}
startDate?: Date  // default: dzisiaj
```

**Zwraca:** `PlannedMealInsert[]` (21 elementów)

**Rzuca błąd gdy:**

- Nie znaleziono przepisów dla danego typu posiłku
- Nieoczekiwana liczba posiłków w planie (≠21)

### `generateDayPlan(userId, date, userProfile)`

Generuje plan dla pojedynczego dnia (3 posiłki).

**Zwraca:** `PlannedMealInsert[]` (3 elementy)

### `cleanupOldMealPlans(userId)`

Usuwa plany posiłków starsze niż dzisiejsza data.

**Zwraca:** liczba usuniętych rekordów

### `findMissingDays(userId, dates)`

Znajduje dni bez kompletnego planu (brak 3 posiłków).

**Zwraca:** `string[]` (daty bez kompletnego planu)

## Typy danych

### `PlannedMealDTO`

```typescript
{
  id: number
  meal_date: string           // YYYY-MM-DD
  meal_type: MealType         // 'breakfast' | 'lunch' | 'dinner'
  is_eaten: boolean
  ingredient_overrides: IngredientOverride[] | null
  recipe: RecipeDTO
  created_at: string
}
```

### `WeekPlanViewModel`

```typescript
{
  days: DayPlanViewModel[]    // 7 dni
  startDate: string           // YYYY-MM-DD
  endDate: string             // YYYY-MM-DD
}
```

### `DayPlanViewModel`

```typescript
{
  date: string // YYYY-MM-DD
  dayName: string // 'Poniedziałek', 'Wtorek', ...
  dayNumber: number // 1-31
  monthName: string // 'Sty', 'Lut', ...
  isToday: boolean
  isPast: boolean
  breakfast: PlannedMealDTO | null
  lunch: PlannedMealDTO | null
  dinner: PlannedMealDTO | null
}
```

## Utilities

### `transformToWeekViewModel(meals, startDate, endDate)`

Transformuje płaską listę posiłków do struktury tygodniowego widoku.

```tsx
const weekPlan = transformToWeekViewModel(meals, startDate, endDate)
```

### `isMealPlanComplete(weekPlan)`

Sprawdza czy plan jest kompletny (21 posiłków).

```tsx
const isComplete = isMealPlanComplete(weekPlan)
// true = 21 meals, false = brakuje meals
```

### `getMissingMealsCount(weekPlan)`

Oblicza liczbę brakujących posiłków.

```tsx
const missing = getMissingMealsCount(weekPlan)
// 0-21
```

### `getDayNutrition(day)`

Oblicza sumę składników odżywczych dla dnia.

```tsx
const nutrition = getDayNutrition(day)
// { calories, protein, carbs, fats }
```

## Przykłady użycia

### Generowanie planu na ekranie Meal Plan

```tsx
export default function MealPlanScreen() {
  const { startDate, endDate } = getCurrentWeekRange()
  const { data: meals, isLoading } = usePlannedMealsRange(startDate, endDate)
  const generatePlanMutation = useGenerateMealPlan()

  const weekPlan = meals
    ? transformToWeekViewModel(meals, startDate, endDate)
    : null

  const needsGeneration = weekPlan && !isMealPlanComplete(weekPlan)
  const missingCount = weekPlan ? getMissingMealsCount(weekPlan) : 0

  return (
    <View>
      {needsGeneration && (
        <AutoGeneratePrompt
          missingCount={missingCount}
          onGenerate={() => generatePlanMutation.mutate()}
        />
      )}

      {weekPlan?.days.map((day) => (
        <DayCard key={day.date} day={day} />
      ))}
    </View>
  )
}
```

### Programowe generowanie planu

```tsx
import { generateWeeklyPlan } from '@/src/services/meal-plan-generator'
import { supabase } from '@/src/lib/supabase/client'

async function generatePlanForUser(userId: string) {
  // 1. Pobierz profil
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, target_calories, target_protein_g, target_carbs_g, target_fats_g'
    )
    .eq('id', userId)
    .single()

  // 2. Wygeneruj plan
  const weeklyPlan = await generateWeeklyPlan(profile)

  // 3. Zapisz do bazy
  await supabase.from('planned_meals').insert(weeklyPlan)

  console.log(`✅ Wygenerowano ${weeklyPlan.length} posiłków`)
}
```

## Automatyczne zarządzanie planem

### Hook: `useAutoMealPlan()`

**Automatyczny mechanizm** działający w tle przy wejściu na ekrany Dashboard lub Meal Plan:

```tsx
export default function DashboardScreen() {
  // Auto-manage meal plan (cleanup + auto-generation)
  useAutoMealPlan()

  // ... reszta komponentu
}
```

**Proces wykonania:**

1. **Weryfikacja**: Sprawdza czy użytkownik jest zalogowany i ma profil
2. **Cleanup**: Usuwa stare plany (dni < dzisiaj)
3. **Detekcja**: Sprawdza brakujące dni w przedziale dzisiaj + 6 dni
4. **Auto-generation**: Automatycznie generuje plan dla brakujących dni
5. **Silent execution**: Działa w tle bez toastów (console.log tylko)

**Cechy:**

- ✅ Wykonuje się tylko raz przy montowaniu (useRef guard)
- ✅ Nie blokuje UI (setTimeout 1s delay)
- ✅ Nie pokazuje toastów (silent background operation)
- ✅ Działa automatycznie przy wejściu na Dashboard/Meal Plan
- ✅ Używa tego samego generatora co manualne wywołanie

**Lokalizacja:**

- Hook: [`src/hooks/use-auto-meal-plan.ts`](../src/hooks/use-auto-meal-plan.ts)
- Użycie: [`app/(tabs)/index.tsx`](<../app/(tabs)/index.tsx>), [`app/(tabs)/meal-plan.tsx`](<../app/(tabs)/meal-plan.tsx>)

## Logika biznesowa

### Warunki generowania

1. **Auto-cleanup**: Przed każdym generowaniem usuwane są plany starsze niż dzisiaj
2. **Incremental generation**: Generowane są tylko brakujące dni (nie nadpisuje istniejących)
3. **Completeness check**: Plan uznaje się za kompletny gdy ma 21 posiłków (7 dni × 3 posiłki)
4. **Auto-execution**: Hook `useAutoMealPlan()` automatycznie sprawdza i generuje przy wejściu na Dashboard/Meal Plan

### Walidacja przepisów

**Podczas selekcji:**

- Przepis musi zawierać odpowiedni `meal_type`
- Kalorie w przedziale ±15% od docelowych na posiłek
- Preferowane są różne przepisy w ramach dnia

**Podczas wymiany:**

- Nowy przepis musi pasować do `meal_type`
- Różnica kaloryczna ≤15% od oryginalnego przepisu
- Reset `ingredient_overrides` po wymianie

### Strategie optymalizacji

**Krok 1: Optymalizacja kalorii (priorytet)**

- Cel: dayCalories ≤ targetCalories (100%)
- Metoda: Redukcja składnika o największej liczbie kalorii
- Limit: max 20% redukcji składnika

**Krok 2: Optymalizacja makro (jeśli kalorie OK)**

- Cel: protein/carbs/fats ≤ 105% target
- Metoda: Redukcja składnika odpowiedzialnego za nadmiar makro
- Limit: max 20% redukcji składnika

## Performance

### Optymalizacje

1. **React Query caching**: Meals cache'owane na 2 minuty
2. **Batch operations**: Wszystkie 21 meals wstawiane jedną operacją
3. **Selective invalidation**: Invalidacja tylko dla zmienionych dat
4. **Lazy generation**: Generowanie tylko dla brakujących dni

### Metrics

- **Single day generation**: ~1-2s (3 queries + optimization)
- **Week generation**: ~7-14s (7 dni × 3 queries)
- **Database operations**: 1 batch insert dla całego tygodnia
- **Memory usage**: ~50KB dla 21 meals z pełnymi przepisami

## Testing

### Unit tests (dla serwisu)

```typescript
describe('meal-plan-generator', () => {
  it('should generate 21 meals for 7 days', async () => {
    const plan = await generateWeeklyPlan(mockProfile)
    expect(plan).toHaveLength(21)
  })

  it('should optimize when calories exceed target', () => {
    const optimized = optimizeDayPlan(dayPlan, recipes, targets)
    expect(optimized[0].ingredient_overrides).toBeTruthy()
  })

  it('should respect 20% max ingredient reduction', () => {
    const { newAmount } = calculateAdjustedAmount(ingredient, 'protein', 50)
    const reduction =
      (ingredient.base_amount - newAmount) / ingredient.base_amount
    expect(reduction).toBeLessThanOrEqual(0.2)
  })
})
```

### Integration tests (dla hooka)

```tsx
describe('useGenerateMealPlan', () => {
  it('should generate meals and invalidate queries', async () => {
    const { result } = renderHook(() => useGenerateMealPlan())

    await act(async () => {
      result.current.mutate()
    })

    expect(result.current.isSuccess).toBe(true)
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: plannedMealsKeys.all,
    })
  })
})
```

## Troubleshooting

### Błąd: "Nie znaleziono przepisu dla [meal_type]"

**Przyczyna:** Brak przepisów w bazie dla danego typu posiłku w przedziale kalorycznym.

**Rozwiązanie:**

1. Sprawdź czy są przepisy z odpowiednim `meal_type` w tabeli `recipes`
2. Zweryfikuj czy `total_calories` są w przedziale ±15% od target
3. Dodaj więcej przepisów do bazy dla danego przedziału kalorycznego

### Błąd: "Plan posiłków już istnieje"

**Przyczyna:** Wszystkie 7 dni mają kompletny plan (21 meals).

**Rozwiązanie:**

1. Usuń istniejące plany poprzez UI lub ręcznie z bazy
2. Zmień zakres dat (np. następny tydzień)
3. Użyj `cleanupOldMealPlans()` do usunięcia starych planów

### Problem: Powtarzające się przepisy w tym samym dniu

**Przyczyna:** Za mało przepisów w bazie dla danego przedziału kalorycznego.

**Rozwiązanie:**

1. Dodaj więcej przepisów do bazy
2. Zwiększ `CALORIE_TOLERANCE` (nie zalecane)
3. Zaakceptuj duplikaty (fallback w kodzie)

### Problem: Nadmierna redukcja składników

**Przyczyna:** Przepisy znacznie przekraczają cele żywieniowe.

**Rozwiązanie:**

1. Dodaj przepisy bliższe celom kalorycznym
2. Zwiększ `MAX_INGREDIENT_CHANGE_PERCENT` (nie zalecane)
3. Ręcznie zmodyfikuj przepisy w bazie

## Roadmap

### Przyszłe usprawnienia

- [ ] **Smart variety**: Algorytm zapewniający różnorodność w całym tygodniu (nie tylko w dniu)
- [ ] **Preferences**: Uwzględnienie preferencji użytkownika (ulubione przepisy, wykluczenia)
- [ ] **Meal swapping**: Wymiana całych dni lub posiłków między dniami
- [ ] **Batch re-optimization**: Ponowna optymalizacja całego tygodnia po zmianie
- [ ] **Offline support**: Generowanie offline z synchronizacją
- [ ] **Progressive enhancement**: Stopniowe dopasowanie planu na podstawie feedbacku

## References

- Web implementation: `WEB/src/services/meal-plan-generator.ts`
- Mobile implementation: `src/services/meal-plan-generator.ts`
- Hook implementation: `src/hooks/api/use-planned-meals.ts`
- UI components: `src/components/meal-plan/`
- Database schema: `supabase/migrations/`
