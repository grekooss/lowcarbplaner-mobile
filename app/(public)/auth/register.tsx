/**
 * Register Screen
 *
 * Ekran rejestracji nowego użytkownika
 */

import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Link } from 'expo-router'
import { useAuth } from '@src/hooks/useAuth'

export default function RegisterScreen() {
  const { register, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleRegister = async () => {
    // Walidacja
    if (!email || !password || !confirmPassword) {
      setValidationError('Wypełnij wszystkie pola')
      return
    }

    if (password.length < 6) {
      setValidationError('Hasło musi mieć minimum 6 znaków')
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Hasła nie są identyczne')
      return
    }

    setValidationError('')
    await register(email, password)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Utwórz konto</Text>
            <Text style={styles.subtitle}>
              Dołącz do LowCarb Planer już dziś
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder='twoj@email.com'
                placeholderTextColor='#6b7280'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hasło</Text>
              <TextInput
                style={styles.input}
                placeholder='Minimum 6 znaków'
                placeholderTextColor='#6b7280'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize='none'
                editable={!isLoading}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Potwierdź hasło</Text>
              <TextInput
                style={styles.input}
                placeholder='Powtórz hasło'
                placeholderTextColor='#6b7280'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize='none'
                editable={!isLoading}
              />
            </View>

            {/* Validation Error */}
            {validationError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            ) : null}

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || !email || !password || !confirmPassword) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading || !email || !password || !confirmPassword}
            >
              {isLoading ? (
                <ActivityIndicator color='#ffffff' />
              ) : (
                <Text style={styles.buttonText}>Zarejestruj się</Text>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.terms}>
              Rejestrując się akceptujesz{'\n'}
              <Text style={styles.termsLink}>Regulamin</Text> i{' '}
              <Text style={styles.termsLink}>Politykę Prywatności</Text>
            </Text>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Masz już konto? </Text>
            <Link href='/auth/login' asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Zaloguj się</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000000',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5A31F4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  terms: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#5A31F4',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#5A31F4',
    fontWeight: '600',
  },
})
