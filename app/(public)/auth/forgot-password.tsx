/**
 * Forgot Password Screen
 *
 * Ekran resetowania hasła - wysyłka linku na email
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
import { Link, useRouter } from 'expo-router'
import { useAuth } from '@src/hooks/useAuth'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { resetPassword, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      return
    }

    await resetPassword(email)
    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Email wysłany!</Text>
            <Text style={styles.successText}>
              Sprawdź swoją skrzynkę pocztową i kliknij w link resetujący hasło.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Powrót do logowania</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
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
            <Text style={styles.title}>Zresetuj hasło</Text>
            <Text style={styles.subtitle}>
              Wyślemy Ci link do zresetowania hasła na podany adres email
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

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.button,
                (isLoading || !email) && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <ActivityIndicator color='#ffffff' />
              ) : (
                <Text style={styles.buttonText}>Wyślij link</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pamiętasz hasło? </Text>
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
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
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
  button: {
    backgroundColor: '#5A31F4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    color: '#10b981',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
})
