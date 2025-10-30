// Jest setup file
// @testing-library/react-native v12.4+ has built-in matchers

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useLocalSearchParams: () => ({}),
  Stack: ({ children }) => children,
  Tabs: ({ children }) => children,
}))

// Mock Unistyles
jest.mock('react-native-unistyles', () => ({
  UnistylesRuntime: {
    setTheme: jest.fn(),
    setAdaptiveThemes: jest.fn(),
  },
  useStyles: jest.fn(() => ({
    styles: {},
    theme: {
      colors: {
        background: '#ffffff',
        typography: '#000000',
        primary: '#5A31F4',
      },
    },
  })),
  createStyleSheet: jest.fn((styles) => styles),
}))

// Mock Expo modules
jest.mock('expo-font')
jest.mock('expo-asset')
jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}))

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}
