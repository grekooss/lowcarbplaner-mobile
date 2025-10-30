# 🚀 Features & Usage Guide

Kompletny przewodnik po funkcjach zaawansowanych w projekcie LowCarbPlaner Mobile.

---

## 📋 Spis Treści

1. [Testing (Jest + React Native Testing Library)](#-testing)
2. [API Integration (TanStack Query)](#-api-integration-tanstack-query)
3. [State Management (Zustand)](#-state-management-zustand)
4. [UI Components (Bottom Sheet + Toast)](#-ui-components)

---

## 🧪 Testing

### Uruchamianie Testów

```bash
# Uruchom wszystkie testy
npm test

# Tryb watch (automatyczne przeładowanie)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Pisanie Testów

**Przykład testu komponentu:**

```tsx
import { render, fireEvent } from '@testing-library/react-native'
import { MyButton } from '@/components/my-button'

describe('MyButton', () => {
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn()
    const { getByText } = render(
      <MyButton onPress={onPressMock}>Click Me</MyButton>
    )

    fireEvent.press(getByText('Click Me'))
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })
})
```

### Struktura Testów

```
components/
├── my-component.tsx
└── __tests__/
    └── my-component.test.tsx
```

**Best Practices:**

- Test zachowania, nie implementacji
- Używaj `getByRole`, `getByLabelText` zamiast `getByTestId`
- Mockuj zewnętrzne zależności (API, Unistyles, Reanimated)

---

## 📡 API Integration (TanStack Query)

### Podstawowe Użycie

**1. Pobieranie Danych (Query)**

```tsx
import { useMeals } from '@src/hooks/api/use-meals'

function MealsScreen() {
  const { data, isLoading, error } = useMeals()

  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />

  return (
    <FlatList data={data} renderItem={({ item }) => <MealCard meal={item} />} />
  )
}
```

**2. Tworzenie Danych (Mutation)**

```tsx
import { useCreateMeal } from '@src/hooks/api/use-meals'
import { toast } from '@src/utils/toast'

function CreateMealForm() {
  const createMeal = useCreateMeal()

  const handleSubmit = async (formData) => {
    try {
      await createMeal.mutateAsync({
        name: formData.name,
        carbs: formData.carbs,
        protein: formData.protein,
        fat: formData.fat,
        calories: formData.calories,
      })
      toast.success('Posiłek dodany pomyślnie!')
    } catch (error) {
      toast.error('Nie udało się dodać posiłku')
    }
  }

  return <Form onSubmit={handleSubmit} />
}
```

**3. Aktualizacja i Usuwanie**

```tsx
import { useUpdateMeal, useDeleteMeal } from '@src/hooks/api/use-meals'

function MealActions({ mealId }) {
  const updateMeal = useUpdateMeal()
  const deleteMeal = useDeleteMeal()

  const handleUpdate = () => {
    updateMeal.mutate({
      id: mealId,
      name: 'Updated Name',
    })
  }

  const handleDelete = () => {
    deleteMeal.mutate(mealId)
  }

  return (
    <>
      <Button onPress={handleUpdate}>Edytuj</Button>
      <Button onPress={handleDelete}>Usuń</Button>
    </>
  )
}
```

### Tworzenie Nowych API Hooków

**Szablon dla nowego endpointu:**

```tsx
// src/hooks/api/use-recipes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE_URL = 'https://api.example.com'

// Query Keys
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  detail: (id: string) => [...recipeKeys.all, 'detail', id] as const,
}

// Funkcje API
async function fetchRecipes() {
  const response = await fetch(`${API_BASE_URL}/recipes`)
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

// Hook
export function useRecipes() {
  return useQuery({
    queryKey: recipeKeys.lists(),
    queryFn: fetchRecipes,
  })
}
```

---

## 🏪 State Management (Zustand)

### Auth Store - Zarządzanie Użytkownikiem

```tsx
import { useAuthStore, useUser } from '@src/stores/use-auth-store'

function ProfileScreen() {
  // Sposób 1: Pełny store (rerender przy każdej zmianie)
  const { user, logout } = useAuthStore()

  // Sposób 2: Selektor (rerender tylko gdy user się zmieni) ✅ LEPSZY
  const user = useUser()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <View>
      <Text>Witaj, {user?.name}!</Text>
      <Button onPress={handleLogout}>Wyloguj</Button>
    </View>
  )
}
```

### App Store - Ustawienia Globalne

```tsx
import { useAppStore, useIsDarkMode } from '@src/stores/use-app-store'

function SettingsScreen() {
  const { isDarkMode, toggleDarkMode, dailyCarbsLimit, setDailyCarbsLimit } =
    useAppStore()

  return (
    <View>
      <Switch value={isDarkMode} onValueChange={toggleDarkMode} />

      <Slider
        value={dailyCarbsLimit}
        onValueChange={setDailyCarbsLimit}
        minimumValue={20}
        maximumValue={150}
      />
    </View>
  )
}
```

### Tworzenie Nowego Store

```tsx
// src/stores/use-shopping-store.ts
import { create } from 'zustand'

interface ShoppingState {
  items: string[]
  addItem: (item: string) => void
  removeItem: (item: string) => void
  clearAll: () => void
}

export const useShoppingStore = create<ShoppingState>((set) => ({
  items: [],

  addItem: (item) => set((state) => ({ items: [...state.items, item] })),

  removeItem: (item) =>
    set((state) => ({ items: state.items.filter((i) => i !== item) })),

  clearAll: () => set({ items: [] }),
}))

// Selektory
export const useShoppingItems = () => useShoppingStore((state) => state.items)
export const useShoppingCount = () =>
  useShoppingStore((state) => state.items.length)
```

---

## 🎨 UI Components

### Toast Messages

**Podstawowe Użycie:**

```tsx
import { toast } from '@src/utils/toast'

function MyComponent() {
  const handleSuccess = () => {
    toast.success('Operacja zakończona pomyślnie!')
  }

  const handleError = () => {
    toast.error('Coś poszło nie tak', 'Błąd serwera')
  }

  const handleInfo = () => {
    toast.info('Nowa wiadomość dostępna')
  }

  return <Button onPress={handleSuccess}>Pokaż Toast</Button>
}
```

**Integracja z API:**

```tsx
const createMeal = useCreateMeal()

const handleCreate = async (data) => {
  try {
    await createMeal.mutateAsync(data)
    toast.success('Posiłek dodany!')
  } catch (error) {
    toast.error(error.message)
  }
}
```

### Bottom Sheet

**Podstawowy Przykład:**

```tsx
import { useRef } from 'react'
import BottomSheet from '@gorhom/bottom-sheet'
import { ExampleBottomSheet } from '@/components/example-bottom-sheet'

function MyScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null)

  const openSheet = () => {
    bottomSheetRef.current?.expand()
  }

  const closeSheet = () => {
    bottomSheetRef.current?.close()
  }

  return (
    <>
      <Button onPress={openSheet}>Otwórz Bottom Sheet</Button>

      <ExampleBottomSheet ref={bottomSheetRef} title='Filtruj Posiłki'>
        <Text>Zawartość formularza filtrowania</Text>
        <Button onPress={closeSheet}>Zamknij</Button>
      </ExampleBottomSheet>
    </>
  )
}
```

**Zaawansowane Użycie:**

```tsx
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

function CustomBottomSheet() {
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], [])

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1} // Start na 50%
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={(index) => console.log('Snap changed to:', index)}
    >
      <BottomSheetView>{/* Custom content */}</BottomSheetView>
    </BottomSheet>
  )
}
```

---

## 🎯 Best Practices

### API Integration

- ✅ Używaj Query Keys dla cache invalidation
- ✅ Obsługuj stany loading/error/success
- ✅ Używaj `mutateAsync` dla flow z try/catch
- ✅ Invalidate related queries po mutacjach

### State Management

- ✅ Używaj selektorów zamiast pełnego store
- ✅ Nie przechowuj danych serwerowych w Zustand (użyj React Query)
- ✅ Dziel store na mniejsze części (auth, app, shopping)
- ✅ Eksportuj selektory jako osobne hooki

### UI Components

- ✅ Używaj toast dla feedback użytkownika
- ✅ Bottom Sheet dla formularzy/filtrów
- ✅ GestureHandlerRootView na najwyższym poziomie (już skonfigurowane)

---

## 📚 Dodatkowe Zasoby

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Bottom Sheet Docs](https://gorhom.github.io/react-native-bottom-sheet/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
