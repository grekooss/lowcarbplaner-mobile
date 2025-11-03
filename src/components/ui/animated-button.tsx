/**
 * AnimatedButton Component
 *
 * Button z animacjami i haptic feedback
 */

import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { hapticMedium } from '@src/utils/haptics'
import { IconSymbol } from '@/components/ui/icon-symbol'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface AnimatedButtonProps {
  onPress: () => void
  title: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

export function AnimatedButton({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 })
    opacity.value = withTiming(0.8, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
    opacity.value = withTiming(1, { duration: 100 })
  }

  const handlePress = () => {
    if (disabled || loading) return
    hapticMedium()
    onPress()
  }

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && iconPosition === 'left' && (
          <IconSymbol
            name={icon}
            size={sizeIconMap[size]}
            color={getIconColor(variant, disabled || loading)}
          />
        )}
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`] as TextStyle,
            styles[`${size}Text`] as TextStyle,
            (disabled || loading) && styles.disabledText,
          ]}
        >
          {loading ? 'Ładowanie...' : title}
        </Text>
        {icon && iconPosition === 'right' && (
          <IconSymbol
            name={icon}
            size={sizeIconMap[size]}
            color={getIconColor(variant, disabled || loading)}
          />
        )}
      </View>
    </AnimatedTouchable>
  )
}

const sizeIconMap = {
  small: 16,
  medium: 20,
  large: 24,
}

function getIconColor(variant: string, disabled: boolean): string {
  if (disabled) return '#9ca3af'
  if (variant === 'primary') return '#ffffff'
  if (variant === 'danger') return '#ef4444'
  if (variant === 'ghost') return '#6b7280'
  return '#5A31F4'
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Variants
  primary: {
    backgroundColor: '#5A31F4',
    borderColor: '#5A31F4',
  },
  secondary: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  danger: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 15,
  },
  secondaryText: {
    color: '#5A31F4',
    fontSize: 15,
  },
  dangerText: {
    color: '#ef4444',
    fontSize: 15,
  },
  ghostText: {
    color: '#6b7280',
    fontSize: 15,
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },

  // States
  disabled: {
    backgroundColor: '#d1d5db',
    borderColor: '#d1d5db',
  },
  disabledText: {
    color: '#9ca3af',
  },

  // Layout
  fullWidth: {
    width: '100%',
  },
})
