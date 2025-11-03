import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { AppQueryClientProvider } from '@src/providers/query-client-provider'
import AuthModal from '@src/components/auth/auth-modal'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppQueryClientProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen
              name='modal'
              options={{ presentation: 'modal', title: 'Modal' }}
            />
          </Stack>
          <StatusBar style='auto' />
          <Toast />
          <AuthModal />
        </ThemeProvider>
      </AppQueryClientProvider>
    </GestureHandlerRootView>
  )
}
