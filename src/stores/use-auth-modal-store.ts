/**
 * Store Zustand dla zarządzania stanem modala autoryzacji
 */
import { create } from 'zustand'

export type AuthModalType = 'signin' | 'signup' | 'reset-password' | null

interface AuthModalStore {
  isVisible: boolean
  modalType: AuthModalType
  onCloseCallback: (() => void) | null
  showAuthModal: (type: AuthModalType, onClose?: () => void) => void
  hideAuthModal: () => void
}

export const useAuthModalStore = create<AuthModalStore>((set, get) => ({
  isVisible: false,
  modalType: null,
  onCloseCallback: null,

  showAuthModal: (type: AuthModalType, onClose?: () => void) => {
    const { onCloseCallback: existingCallback } = get()
    set({
      isVisible: true,
      modalType: type,
      // Zachowaj istniejący callback jeśli nie przekazano nowego
      onCloseCallback: onClose !== undefined ? onClose : existingCallback,
    })
  },

  hideAuthModal: () => {
    const { onCloseCallback } = get()
    set({
      isVisible: false,
      modalType: null,
      onCloseCallback: null,
    })
    // Wywołaj callback po zamknięciu modala
    if (onCloseCallback) {
      onCloseCallback()
    }
  },
}))
