import { Stack } from 'expo-router'

/**
 * Onboarding Layout
 *
 * Stack navigation dla procesu onboardingu:
 * - index - disclaimer
 * - step1 - dane podstawowe
 * - step2 - aktywność i cel
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Nie pozwalaj cofać się gestem
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen name='step1' />
      <Stack.Screen name='step2' />
    </Stack>
  )
}
