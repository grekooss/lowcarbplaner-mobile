/**
 * Animation Utilities
 *
 * Reusable animation configurations for react-native-reanimated
 */

import {
  withSpring,
  withTiming,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated'

/**
 * Spring Animation Presets
 */
export const springPresets = {
  // Quick, snappy animation for buttons and toggles
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  } satisfies WithSpringConfig,

  // Smooth, fluid animation for cards and modals
  smooth: {
    damping: 25,
    stiffness: 200,
    mass: 0.8,
  } satisfies WithSpringConfig,

  // Bouncy animation for feedback
  bouncy: {
    damping: 15,
    stiffness: 250,
    mass: 0.6,
  } satisfies WithSpringConfig,

  // Gentle animation for subtle movements
  gentle: {
    damping: 30,
    stiffness: 150,
    mass: 1,
  } satisfies WithSpringConfig,
}

/**
 * Timing Animation Presets
 */
export const timingPresets = {
  // Fast animation for quick transitions
  fast: {
    duration: 150,
  } satisfies WithTimingConfig,

  // Normal animation for most use cases
  normal: {
    duration: 250,
  } satisfies WithTimingConfig,

  // Slow animation for emphasis
  slow: {
    duration: 400,
  } satisfies WithTimingConfig,

  // Very slow for complex transitions
  verySlow: {
    duration: 600,
  } satisfies WithTimingConfig,
}

/**
 * Helper to create spring animation
 */
export function animateSpring(
  value: number,
  preset: keyof typeof springPresets = 'smooth'
) {
  'worklet'
  return withSpring(value, springPresets[preset])
}

/**
 * Helper to create timing animation
 */
export function animateTiming(
  value: number,
  preset: keyof typeof timingPresets = 'normal'
) {
  'worklet'
  return withTiming(value, timingPresets[preset])
}

/**
 * Stagger delay calculator for list animations
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  'worklet'
  return index * baseDelay
}

/**
 * Pulse animation (for loading states)
 */
export function pulseAnimation(duration: number = 800) {
  'worklet'
  return withTiming(1, { duration }, () => {
    'worklet'
    return withTiming(0.3, { duration })
  })
}

/**
 * Scale animation presets
 */
export const scaleValues = {
  pressed: 0.96,
  default: 1,
  hover: 1.02,
}

/**
 * Opacity animation presets
 */
export const opacityValues = {
  hidden: 0,
  dim: 0.5,
  visible: 1,
}
