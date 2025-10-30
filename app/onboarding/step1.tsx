/**
 * Onboarding Step 1
 *
 * Dane podstawowe: płeć, wiek, waga, wzrost
 */

import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'

type Gender = 'male' | 'female'

export default function OnboardingStep1() {
  const router = useRouter()

  const [gender, setGender] = useState<Gender | null>(null)
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')

  const isValid =
    gender &&
    age &&
    weight &&
    height &&
    Number(age) > 0 &&
    Number(weight) > 0 &&
    Number(height) > 0

  const handleContinue = () => {
    if (!isValid) return

    // TODO: Zapisać dane w stanie/context
    router.push('/onboarding/step2')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.content}>
          {/* Progress */}
          <View style={styles.progress}>
            <View style={[styles.progressBar, { width: '33%' }]} />
          </View>
          <Text style={styles.progressText}>Krok 1 z 3</Text>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Twoje dane podstawowe</Text>
            <Text style={styles.subtitle}>
              Pomogą nam obliczyć idealne zapotrzebowanie kaloryczne
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Gender Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Płeć</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === 'male' && styles.genderButtonTextActive,
                    ]}
                  >
                    Mężczyzna
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === 'female' && styles.genderButtonTextActive,
                    ]}
                  >
                    Kobieta
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Age */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Wiek (lata)</Text>
              <TextInput
                style={styles.input}
                placeholder='np. 35'
                placeholderTextColor='#6b7280'
                value={age}
                onChangeText={setAge}
                keyboardType='number-pad'
              />
            </View>

            {/* Weight */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Waga (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder='np. 75'
                placeholderTextColor='#6b7280'
                value={weight}
                onChangeText={setWeight}
                keyboardType='decimal-pad'
              />
            </View>

            {/* Height */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Wzrost (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder='np. 175'
                placeholderTextColor='#6b7280'
                value={height}
                onChangeText={setHeight}
                keyboardType='number-pad'
              />
            </View>
          </View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Wstecz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!isValid}
            >
              <Text style={styles.buttonText}>Dalej</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  progress: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5A31F4',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
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
    flex: 1,
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
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#5A31F4',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  genderButtonTextActive: {
    color: '#5A31F4',
  },
  navigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 2,
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
