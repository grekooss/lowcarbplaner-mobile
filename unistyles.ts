// Plik konfiguracyjny Unistyles 3.x
// Importowane RAZ w głównym pliku _layout.tsx
import { UnistylesRuntime } from 'react-native-unistyles'
import { breakpoints, darkTheme, lightTheme } from '@src/styles/unistyles'

// Ustaw domyślny motyw
UnistylesRuntime.setTheme('light')

// Ustaw breakpointy
UnistylesRuntime.setAdaptiveThemes(true)

// Eksportuj motywy i breakpointy
export { breakpoints, darkTheme, lightTheme }
