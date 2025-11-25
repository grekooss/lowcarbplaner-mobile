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
import { useEffect } from 'react'
import * as NavigationBar from 'expo-navigation-bar'
import { Platform } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { AppQueryClientProvider } from '@src/providers/query-client-provider'
import AuthModal from '@src/components/auth/auth-modal'
import { OnboardingGuard } from '@src/components/auth/onboarding-guard'
import { OnboardingProvider } from '@src/contexts/OnboardingContext'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  useEffect(() => {
    // Ukryj systemowe przyciski nawigacji na Androidzie
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden')
      NavigationBar.setBackgroundColorAsync('#f9fafb')
    }
  }, [])

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppQueryClientProvider>
          <OnboardingProvider>
            <ThemeProvider
              value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
              <Stack>
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                <Stack.Screen
                  name='onboarding'
                  options={{ headerShown: false, gestureEnabled: false }}
                />
                <Stack.Screen
                  name='modal'
                  options={{ presentation: 'modal', title: 'Modal' }}
                />
              </Stack>
              <StatusBar style='dark' backgroundColor='#f9fafb' />
              <Toast />
              <AuthModal />
              <OnboardingGuard />
            </ThemeProvider>
          </OnboardingProvider>
        </AppQueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
