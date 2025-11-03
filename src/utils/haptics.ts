/**
 * Haptic Feedback Utilities
 *
 * Consistent haptic feedback patterns across the app
 */

import * as Haptics from 'expo-haptics'

/**
 * Light haptic feedback
 * Use for: Selection changes, toggles, checkbox interactions
 */
export function hapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

/**
 * Medium haptic feedback
 * Use for: Button presses, card taps, navigation
 */
export function hapticMedium() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

/**
 * Heavy haptic feedback
 * Use for: Important actions, deletions, confirmations
 */
export function hapticHeavy() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
}

/**
 * Success haptic feedback
 * Use for: Successful operations, form submissions, completions
 */
export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}

/**
 * Warning haptic feedback
 * Use for: Warnings, validation errors, caution situations
 */
export function hapticWarning() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
}

/**
 * Error haptic feedback
 * Use for: Errors, failures, critical issues
 */
export function hapticError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}

/**
 * Selection haptic feedback
 * Use for: Item selection in lists, radio buttons
 */
export function hapticSelection() {
  Haptics.selectionAsync()
}

/**
 * Custom haptic patterns
 */

/**
 * Double tap feedback
 */
export async function hapticDoubleTap() {
  await hapticLight()
  setTimeout(() => hapticLight(), 100)
}

/**
 * Long press feedback
 */
export function hapticLongPress() {
  hapticMedium()
}

/**
 * Swipe feedback
 */
export function hapticSwipe() {
  hapticLight()
}

/**
 * Pull to refresh feedback
 */
export function hapticRefresh() {
  hapticMedium()
}

/**
 * Add to list feedback
 */
export function hapticAdd() {
  hapticSuccess()
}

/**
 * Remove from list feedback
 */
export function hapticRemove() {
  hapticWarning()
}
