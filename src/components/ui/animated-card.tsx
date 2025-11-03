/**
 * AnimatedCard Component
 *
 * Karta z animacjami wejścia i interakcji
 */

import { type ReactNode } from 'react'
import { TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated'
import { hapticLight } from '@src/utils/haptics'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface AnimatedCardProps {
  children: ReactNode
  onPress?: () => void
  index?: number
  disabled?: boolean
  style?: ViewStyle
  variant?: 'default' | 'elevated' | 'outlined'
}

/**
 * Animowana karta z efektami wejścia i naciśnięcia
 */
export function AnimatedCard({
  children,
  onPress,
  index = 0,
  disabled = false,
  style,
  variant = 'default',
}: AnimatedCardProps) {
  const scale = useSharedValue(1)
  const shadowOpacity = useSharedValue(0.1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 300 })
    shadowOpacity.value = withTiming(0.15, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
    shadowOpacity.value = withTiming(0.1, { duration: 100 })
  }

  const handlePress = () => {
    if (disabled) return
    hapticLight()
    onPress?.()
  }

  // Staggered entrance animation
  const entering = FadeInDown.delay(index * 50)
    .duration(300)
    .springify()
    .damping(20)
    .stiffness(200)

  const exiting = FadeOutUp.duration(200)

  const Component = onPress ? AnimatedTouchable : Animated.View

  return (
    <Component
      entering={entering}
      exiting={exiting}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      onPress={onPress ? handlePress : undefined}
      disabled={disabled}
      activeOpacity={1}
      style={[
        styles.card,
        styles[variant],
        onPress && styles.pressable,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Component>
  )
}

/**
 * Simple animated view with entrance animation
 */
export function AnimatedView({
  children,
  index = 0,
  style,
}: {
  children: ReactNode
  index?: number
  style?: ViewStyle
}) {
  const entering = FadeInDown.delay(index * 50)
    .duration(300)
    .springify()
    .damping(20)
    .stiffness(200)

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },

  // Variants
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },

  // States
  pressable: {
    // Style will be applied when onPress is provided
  },
})
