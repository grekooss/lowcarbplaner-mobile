/**
 * Modal autoryzacji - logowanie i rejestracja użytkownika
 */
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuthModalStore } from '@src/stores/use-auth-modal-store'
import { useAuth } from '@src/hooks/useAuth'

export default function AuthModal() {
  const { isVisible, modalType, hideAuthModal, showAuthModal } =
    useAuthModalStore()
  const { login, register, resetPassword, isLoading } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // Stany formularza
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Stany walidacji
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  // Funkcje walidacyjne
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return 'Email jest wymagany'
    }
    if (!emailRegex.test(email)) {
      return 'Nieprawidłowy format email'
    }
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Hasło jest wymagane'
    }
    if (password.length < 8) {
      return 'Hasło musi mieć co najmniej 8 znaków'
    }
    return ''
  }

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ) => {
    if (!confirmPassword) {
      return 'Potwierdzenie hasła jest wymagane'
    }
    if (password !== confirmPassword) {
      return 'Hasła nie są identyczne'
    }
    return ''
  }

  // Obsługa zmian w polach
  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (text || emailError) {
      const error = validateEmail(text)
      setEmailError(error)
    }
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (text || passwordError) {
      const error = validatePassword(text)
      setPasswordError(error)
    }
    if (isSignUp && confirmPassword) {
      const confirmError = validateConfirmPassword(text, confirmPassword)
      setConfirmPasswordError(confirmError)
    }
  }

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text)
    if (text || confirmPasswordError) {
      const error = validateConfirmPassword(password, text)
      setConfirmPasswordError(error)
    }
  }

  // Walidacja całego formularza
  const validateForm = () => {
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    let confirmPasswordErr = ''

    if (isSignUp) {
      confirmPasswordErr = validateConfirmPassword(password, confirmPassword)
    }

    setEmailError(emailErr)
    setPasswordError(passwordErr)
    setConfirmPasswordError(confirmPasswordErr)

    return !emailErr && !passwordErr && !confirmPasswordErr
  }

  // Obsługa submitu
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setSubmitError('')

    try {
      if (isSignUp) {
        await register(email, password)
      } else {
        await login(email, password)
      }

      // Sukces - zamknij modal i wyczyść formularz
      handleCloseModal()
    } catch (error: any) {
      setSubmitError(error.message || 'Wystąpił nieoczekiwany błąd')
    }
  }

  // Obsługa resetowania hasła
  const handleResetPassword = async () => {
    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailError(emailErr)
      return
    }

    setSubmitError('')

    try {
      await resetPassword(email)
      setResetEmailSent(true)
    } catch (error: any) {
      setSubmitError(
        error.message || 'Wystąpił błąd podczas wysyłania emaila resetującego'
      )
    }
  }

  // Funkcja czyszcząca stan formularza
  const clearForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setSubmitError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setResetEmailSent(false)
  }

  // Funkcja zamykania modalu z czyszczeniem
  const handleCloseModal = () => {
    clearForm()
    hideAuthModal()
  }

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true)
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false)
      }
    )

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [])

  if (!isVisible) {
    return null
  }

  const isSignUp = modalType === 'signup'
  const isResetPassword = modalType === 'reset-password'

  // Jeśli email został wysłany, pokaż komunikat potwierdzenia
  if (resetEmailSent && isResetPassword) {
    return (
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalContent}>
            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Email wysłany</Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  <Ionicons name='close' size={20} color='#6B7280' />
                </TouchableOpacity>
              </View>

              <View style={styles.successContainer}>
                <Ionicons name='checkmark-circle' size={64} color='#059669' />
                <Text style={styles.successTitle}>
                  Sprawdź swoją skrzynkę pocztową
                </Text>
                <Text style={styles.successMessage}>
                  Wysłaliśmy link do resetowania hasła na adres:{'\n'}
                  <Text style={styles.emailHighlight}>{email}</Text>
                  {'\n\n'}
                  Kliknij w link w emailu, aby ustawić nowe hasło.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.loginButtonText}>Zamknij</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => {
                  setResetEmailSent(false)
                  showAuthModal('signin')
                }}
              >
                <Text style={styles.registerLinkText}>
                  Powrót do{' '}
                  <Text style={styles.registerLinkBold}>logowania</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isKeyboardVisible && styles.scrollContainerWithKeyboard,
        ]}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={true}
        indicatorStyle='default'
      >
        <View style={styles.modalContent}>
          <View style={styles.contentContainer}>
            {/* Nagłówek z przyciskiem zamknięcia */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isResetPassword
                  ? 'Resetuj hasło'
                  : isSignUp
                    ? 'Zarejestruj się'
                    : 'Zaloguj się'}
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Ionicons name='close' size={20} color='#6B7280' />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              {isResetPassword
                ? 'Wprowadź swój adres email, a my wyślemy Ci link do resetowania hasła'
                : isSignUp
                  ? 'Utwórz nowe konto, aby uzyskać pełny dostęp'
                  : 'Zaloguj się, aby uzyskać dostęp do pełnej wersji aplikacji'}
            </Text>

            {/* Pola formularza */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.textInput, emailError && styles.textInputError]}
                placeholder='Wprowadź adres email'
                placeholderTextColor='#9CA3AF'
                keyboardType='email-address'
                autoCapitalize='none'
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => {
                  if (email) {
                    const error = validateEmail(email)
                    setEmailError(error)
                  }
                }}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Wyświetl hasło tylko gdy nie resetujemy hasła */}
            {!isResetPassword && (
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Hasło</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      passwordError && styles.passwordInputError,
                    ]}
                    placeholder={isSignUp ? 'Utwórz hasło' : 'Wprowadź hasło'}
                    placeholderTextColor='#9CA3AF'
                    secureTextEntry={!showPassword}
                    autoCapitalize='none'
                    value={password}
                    onChangeText={handlePasswordChange}
                    onBlur={() => {
                      if (password) {
                        const error = validatePassword(password)
                        setPasswordError(error)
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => {
                      const newShowPassword = !showPassword
                      setShowPassword(newShowPassword)
                      if (isSignUp) {
                        setShowConfirmPassword(newShowPassword)
                      }
                    }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color='#6B7280'
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>
            )}

            {/* Potwierdzenie hasła tylko dla rejestracji */}
            {isSignUp && !isResetPassword && (
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Potwierdź hasło</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      confirmPasswordError && styles.passwordInputError,
                    ]}
                    placeholder='Potwierdź hasło'
                    placeholderTextColor='#9CA3AF'
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize='none'
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    onBlur={() => {
                      if (confirmPassword) {
                        const error = validateConfirmPassword(
                          password,
                          confirmPassword
                        )
                        setConfirmPasswordError(error)
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => {
                      const newShowConfirmPassword = !showConfirmPassword
                      setShowConfirmPassword(newShowConfirmPassword)
                      setShowPassword(newShowConfirmPassword)
                    }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color='#6B7280'
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text style={styles.errorText}>{confirmPasswordError}</Text>
                ) : null}
              </View>
            )}

            {/* Wyświetlanie błędów */}
            {submitError && (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            )}

            {/* Przycisk główny */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={isResetPassword ? handleResetPassword : handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color='white' />
              ) : (
                <Text style={styles.loginButtonText}>
                  {isResetPassword
                    ? 'Wyślij link resetujący'
                    : isSignUp
                      ? 'Zarejestruj się'
                      : 'Zaloguj się'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Link przełączający */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => {
                clearForm()
                if (isResetPassword) {
                  showAuthModal('signin')
                } else {
                  showAuthModal(isSignUp ? 'signin' : 'signup')
                }
              }}
            >
              <Text style={styles.registerLinkText}>
                {isResetPassword ? (
                  <>
                    Pamiętasz hasło?{' '}
                    <Text style={styles.registerLinkBold}>Zaloguj się</Text>
                  </>
                ) : isSignUp ? (
                  <>
                    Masz już konto?{' '}
                    <Text style={styles.registerLinkBold}>Zaloguj się</Text>
                  </>
                ) : (
                  <>
                    Nie masz konta?{' '}
                    <Text style={styles.registerLinkBold}>Zarejestruj się</Text>
                  </>
                )}
              </Text>
            </TouchableOpacity>

            {/* Link do resetowania hasła tylko na stronie logowania */}
            {!isSignUp && !isResetPassword && (
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={() => {
                  clearForm()
                  showAuthModal('reset-password')
                }}
              >
                <Text style={styles.forgotPasswordText}>
                  Zapomniałeś hasła?
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  scrollContainer: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  scrollContainerWithKeyboard: {
    minHeight: '100%',
    justifyContent: 'flex-start',
    paddingVertical: 40,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    width: '100%',
    maxWidth: 400,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  formField: {
    width: '100%',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 48,
  },
  loginButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  generalErrorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  registerLink: {
    padding: 8,
  },
  registerLinkText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
  },
  registerLinkBold: {
    fontWeight: '600',
  },
  textInputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  passwordInputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#10b981',
  },
  forgotPasswordLink: {
    padding: 8,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
})
