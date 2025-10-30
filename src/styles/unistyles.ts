// Definiowanie punktów przełamania (breakpoints) dla responsywności
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 1024,
} as const

// Definiowanie motywów (np. jasny i ciemny)
export const lightTheme = {
  colors: {
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#000000',
    textMuted: '#6b7280',
    typography: '#000000',
    primary: '#5A31F4',
    secondary: '#E6F4FE',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981',
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
  },
  margins: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
} as const

export const darkTheme = {
  colors: {
    background: '#0B0B0B',
    surface: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#9ca3af',
    typography: '#ffffff',
    primary: '#5A31F4',
    secondary: '#1A1A1A',
    border: '#374151',
    error: '#ef4444',
    success: '#10b981',
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
  },
  margins: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
} as const

// Typy dla TypeScript
type AppBreakpoints = typeof breakpoints
type AppThemes = {
  light: typeof lightTheme
  dark: typeof darkTheme
}

// Rozszerzenie typów react-native-unistyles (Unistyles 3.x)
declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}
