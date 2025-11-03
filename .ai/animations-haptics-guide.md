# Animations & Haptic Feedback Guide

## 📱 Przegląd

LowCarb Planer Mobile został wzbogacony o profesjonalne animacje i haptic feedback, które znacząco poprawiają doświadczenie użytkownika.

## 🎨 Animations System

### Dostępne narzędzia

#### `src/utils/animations.ts`

**Spring Animation Presets**:

```typescript
import { springPresets, animateSpring } from '@src/utils/animations'

// Użycie
scale.value = animateSpring(1, 'snappy') // Szybka, ostra animacja
scale.value = animateSpring(1, 'smooth') // Płynna, naturalna (domyślna)
scale.value = animateSpring(1, 'bouncy') // Odbijająca się
scale.value = animateSpring(1, 'gentle') // Delikatna
```

**Timing Animation Presets**:

```typescript
import { timingPresets, animateTiming } from '@src/utils/animations'

// Użycie
opacity.value = animateTiming(1, 'fast') // 150ms
opacity.value = animateTiming(1, 'normal') // 250ms (domyślny)
opacity.value = animateTiming(1, 'slow') // 400ms
opacity.value = animateTiming(1, 'verySlow') // 600ms
```

**Staggered Animations**:

```typescript
import { getStaggerDelay } from '@src/utils/animations'

// Dla list - każdy element z 50ms opóźnieniem
const entering = FadeInDown.delay(getStaggerDelay(index))
```

### Gotowe komponenty animowane

#### `AnimatedButton`

Button z animations i haptic feedback:

```tsx
import { AnimatedButton } from '@src/components/ui/animated-button'
;<AnimatedButton
  title='Zapisz'
  variant='primary' // primary | secondary | danger | ghost
  size='medium' // small | medium | large
  icon='checkmark' // Opcjonalna ikona SF Symbols
  iconPosition='left' // left | right
  onPress={handleSave}
  loading={isSaving}
  disabled={!hasChanges}
  fullWidth
/>
```

**Animacje**:

- Scale 0.96 przy naciskaniu
- Opacity 0.8 przy naciskaniu
- Spring bounce przy zwolnieniu
- Automatyczny haptic feedback

#### `AnimatedCard`

Karta z entrance animations:

```tsx
import { AnimatedCard } from '@src/components/ui/animated-card'
;<AnimatedCard
  index={index} // Dla staggered animation
  onPress={handlePress}
  variant='elevated' // default | elevated | outlined
>
  <View>{/* Zawartość karty */}</View>
</AnimatedCard>
```

**Animacje**:

- FadeInDown entrance z stagger (50ms × index)
- Scale 0.98 przy naciskaniu
- Shadow opacity animation

## 🎯 Haptic Feedback System

### Dostępne funkcje

#### `src/utils/haptics.ts`

**Impact Feedback** (dotyk fizyczny):

```typescript
import { hapticLight, hapticMedium, hapticHeavy } from '@src/utils/haptics'

hapticLight() // Lekkie: checkboxy, toggles, selection
hapticMedium() // Średnie: przyciski, nawigacja
hapticHeavy() // Ciężkie: ważne akcje, usuwanie
```

**Notification Feedback** (feedback o wyniku):

```typescript
import { hapticSuccess, hapticWarning, hapticError } from '@src/utils/haptics'

hapticSuccess() // Sukces: zapisanie, ukończenie
hapticWarning() // Ostrzeżenie: wylogowanie, usuwanie
hapticError() // Błąd: walidacja, niepowodzenie
```

**Selection Feedback** (wybór z listy):

```typescript
import { hapticSelection } from '@src/utils/haptics'

hapticSelection() // Radio buttons, segmented controls
```

**Custom Patterns**:

```typescript
import { hapticRefresh, hapticAdd, hapticRemove } from '@src/utils/haptics'

hapticRefresh() // Pull-to-refresh
hapticAdd() // Dodanie do listy (success)
hapticRemove() // Usunięcie z listy (warning)
```

## 📍 Gdzie są używane

### Recipe Card

- **FadeInDown entrance** z staggered delay (50ms × index)
- **Scale animation** przy naciskaniu (0.97)
- **Haptic light** przy tapie

```tsx
// app/(tabs)/recipes.tsx
<RecipeCard recipe={item} onPress={handlePress} index={index} />
```

### Shopping List Items

- **Success haptic** przy zaznaczaniu jako kupione
- **Light haptic** przy odznaczaniu

```tsx
// src/components/shopping-list/shopping-list-item.tsx
const handleToggle = () => {
  if (!item.is_purchased) {
    hapticSuccess() // Sukces!
  } else {
    hapticLight() // Zwykłe odznaczenie
  }
  onTogglePurchased(item.ingredient_id, !item.is_purchased)
}
```

### Profile Form

- **Selection haptic** przy zmianie płci (segmented control)
- **Selection haptic** przy zmianie poziomu aktywności
- **Medium haptic** przy zapisie formularza

```tsx
// src/components/profile/profile-form.tsx
const handleGenderChange = (newGender: 'male' | 'female') => {
  hapticSelection()
  setGender(newGender)
}
```

### Profile Screen

- **Success haptic** przy pomyślnym zapisie profilu
- **Medium haptic** przy otwieraniu dialogu generowania planu
- **Warning haptic** przy otwieraniu dialogu wylogowania
- **Medium haptic** przy potwierdzeniu akcji

```tsx
// app/(tabs)/profile.tsx
const handleLogout = () => {
  hapticWarning() // Ostrzeżenie o wylogowaniu
  Alert.alert('Wyloguj się', 'Czy na pewno?', [
    { text: 'Anuluj', style: 'cancel' },
    {
      text: 'Wyloguj',
      style: 'destructive',
      onPress: () => {
        hapticMedium() // Potwierdzenie akcji
        logout()
      },
    },
  ])
}
```

## 🎨 Best Practices

### Animations

1. **Używaj staggered animations dla list**:

   ```tsx
   renderItem={({ item, index }) => (
     <AnimatedCard index={index}>...</AnimatedCard>
   )}
   ```

2. **Wybieraj odpowiedni preset**:
   - `snappy` - przyciski, quick actions
   - `smooth` - karty, modals (domyślny)
   - `bouncy` - success feedback
   - `gentle` - subtle movements

3. **Unikaj over-animation**:
   - Nie animuj wszystkiego
   - Zachowaj spójność presetów
   - Testuj na urządzeniu fizycznym

### Haptic Feedback

1. **Dopasuj siłę do akcji**:
   - Light: selection changes, checkboxes
   - Medium: button presses, navigation
   - Heavy: important actions, deletions

2. **Używaj notification feedback dla wyników**:
   - Success: save, complete, add
   - Warning: logout, delete, remove
   - Error: validation, failures

3. **Nie nadużywaj**:
   - Jeden haptic na akcję
   - Nie dla animacji auto-play
   - Nie dla scroll events

## 📈 Performance

### Animations

- **react-native-reanimated 4.1.1** - animacje na UI thread
- **Worklet functions** - zero overhead JS thread
- **Spring physics** - naturalne, responsywne

### Haptics

- **expo-haptics 15.0.7** - natywne API iOS/Android
- **Async calls** - non-blocking
- **Hardware-accelerated** - wykorzystuje Taptic Engine (iOS)

## 🔧 Customization

### Tworzenie własnych presetów

```typescript
// src/utils/animations.ts
export const customSpring = {
  damping: 25,
  stiffness: 250,
  mass: 0.7,
}

// Użycie
scale.value = withSpring(1, customSpring)
```

### Tworzenie własnych haptic patterns

```typescript
// src/utils/haptics.ts
export async function hapticTripleTap() {
  await hapticLight()
  setTimeout(() => hapticLight(), 80)
  setTimeout(() => hapticLight(), 160)
}
```

## ✨ Rezultat

Aplikacja teraz oferuje:

- ⚡ **60 FPS animations** - płynne i responsywne
- 📱 **Native-like UX** - feels like system app
- 🎯 **Intuitive feedback** - użytkownik wie co się dzieje
- 💎 **Premium feel** - profesjonalna jakość

## 🚀 Next Steps (Opcjonalne)

- **Shared Element Transitions** - dla navigation między screens
- **Gesture-based interactions** - swipe to delete, long press
- **Advanced animations** - complex sequences, chained animations
- **Custom haptic patterns** - per-feature custom feedback

---

**Implementacja**: 2025-11-03
**Status**: ✅ Production Ready
**Progress**: Phase 7 (Polish) - 91.1% Complete
