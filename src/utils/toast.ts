import Toast from 'react-native-toast-message'

/**
 * Toast utilities - wygodne helpery dla powiadomień Toast
 */

export const toast = {
  /**
   * Pokaż sukces
   */
  success: (message: string, title = 'Sukces') => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: 3000,
      position: 'top',
    })
  },

  /**
   * Pokaż błąd
   */
  error: (message: string, title = 'Błąd') => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: 4000,
      position: 'top',
    })
  },

  /**
   * Pokaż info
   */
  info: (message: string, title = 'Informacja') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: 3000,
      position: 'top',
    })
  },

  /**
   * Pokaż ostrzeżenie
   */
  warning: (message: string, title = 'Uwaga') => {
    Toast.show({
      type: 'info', // Toast nie ma typu 'warning' domyślnie
      text1: title,
      text2: message,
      visibilityTime: 3500,
      position: 'top',
    })
  },

  /**
   * Ukryj aktywny toast
   */
  hide: () => {
    Toast.hide()
  },
}
