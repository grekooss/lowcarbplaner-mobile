/**
 * Store Zustand dla zarządzania stanem modala autoryzacji
 */
import { create } from 'zustand'

export type AuthModalType = 'signin' | 'signup' | 'reset-password' | null

interface AuthModalStore {
  isVisible: boolean
  modalType: AuthModalType
  showAuthModal: (type: AuthModalType) => void
  hideAuthModal: () => void
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isVisible: false,
  modalType: null,

  showAuthModal: (type: AuthModalType) => {
    set({
      isVisible: true,
      modalType: type,
    })
  },

  hideAuthModal: () => {
    set({
      isVisible: false,
      modalType: null,
    })
  },
}))
