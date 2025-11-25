/**
 * Onboarding Flow - Main Entry
 *
 * Pierwszy ekran onboardingu z disclaimerem
 */

import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import Checkbox from 'expo-checkbox'
import { supabase } from '@src/lib/supabase/client'
import { useAuth } from '@src/hooks/useAuth'
import Toast from 'react-native-toast-message'

export default function OnboardingScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!disclaimerAccepted || !user) return

    setLoading(true)

    try {
      // Zapisz disclaimer_accepted_at w bazie
      const { error } = await supabase
        .from('profiles')
        .update({
          disclaimer_accepted_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Kontynuuj do kolejnych kroków
      router.push('/onboarding/step1')
    } catch (error) {
      console.error('Error accepting disclaimer:', error)
      Toast.show({
        type: 'error',
        text1: 'Błąd',
        text2: 'Nie udało się zapisać zgody. Spróbuj ponownie.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Witaj w LowCarb Planer! 👋</Text>
          <Text style={styles.subtitle}>
            Zanim zaczniemy, przeczytaj ważne informacje
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerTitle}>
            ⚠️ Ważne zastrzeżenia medyczne
          </Text>
          <Text style={styles.disclaimerText}>
            <Text style={styles.bold}>LowCarb Planer</Text> to narzędzie
            wspierające planowanie posiłków, ale nie zastępuje konsultacji z
            lekarzem lub dietetykiem.
          </Text>
          <View style={styles.disclaimerPoints}>
            <Text style={styles.point}>
              • Przed rozpoczęciem diety skonsultuj się z lekarzem
            </Text>
            <Text style={styles.point}>
              • Dieta low-carb może nie być odpowiednia dla każdego
            </Text>
            <Text style={styles.point}>
              • Aplikacja nie diagnozuje ani nie leczy chorób
            </Text>
            <Text style={styles.point}>
              • Obliczenia są przybliżone i mogą wymagać dostosowania
            </Text>
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setDisclaimerAccepted(!disclaimerAccepted)}
          activeOpacity={0.8}
        >
          <Checkbox
            value={disclaimerAccepted}
            onValueChange={setDisclaimerAccepted}
            color={disclaimerAccepted ? '#5A31F4' : undefined}
            style={styles.checkbox}
          />
          <Text style={styles.checkboxLabel}>
            Rozumiem i akceptuję powyższe zastrzeżenia
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (!disclaimerAccepted || loading) && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!disclaimerAccepted || loading}
        >
          {loading ? (
            <ActivityIndicator color='#ffffff' />
          ) : (
            <Text style={styles.buttonText}>Kontynuuj</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  disclaimerContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  disclaimerPoints: {
    marginTop: 8,
  },
  point: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 22,
    marginBottom: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    padding: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
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
})
