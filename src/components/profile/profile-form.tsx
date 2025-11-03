/**
 * ProfileForm Component
 *
 * Formularz edycji profilu użytkownika:
 * - Imię i nazwisko (opcjonalne)
 * - Email (readonly z auth)
 * - Waga i wzrost
 * - Płeć
 * - Poziom aktywności
 */

import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { hapticSelection, hapticMedium } from '@src/utils/haptics'
import type { Tables } from '@src/types/database.types'

interface ProfileFormProps {
  profile: Tables<'profiles'>
  userEmail?: string
  onSave: (data: Partial<Tables<'profiles'>>) => void
  isSaving?: boolean
}

/**
 * Formularz edycji profilu
 */
export function ProfileForm({
  profile,
  userEmail,
  onSave,
  isSaving,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [weight, setWeight] = useState(profile.weight_kg?.toString() || '')
  const [height, setHeight] = useState(profile.height_cm?.toString() || '')
  const [gender, setGender] = useState<'male' | 'female' | null>(
    profile.gender as 'male' | 'female' | null
  )
  const [activityLevel, setActivityLevel] = useState<
    'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  >((profile.activity_level as any) || 'moderate')

  const handleSave = () => {
    hapticMedium()
    onSave({
      full_name: fullName || null,
      weight_kg: weight ? parseFloat(weight) : null,
      height_cm: height ? parseFloat(height) : null,
      gender: gender,
      activity_level: activityLevel,
    })
  }

  const handleGenderChange = (newGender: 'male' | 'female') => {
    hapticSelection()
    setGender(newGender)
  }

  const handleActivityChange = (
    level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  ) => {
    hapticSelection()
    setActivityLevel(level)
  }

  const hasChanges =
    fullName !== (profile.full_name || '') ||
    weight !== (profile.weight_kg?.toString() || '') ||
    height !== (profile.height_cm?.toString() || '') ||
    gender !== profile.gender ||
    activityLevel !== profile.activity_level

  return (
    <View style={styles.container}>
      {/* Full Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Imię i nazwisko (opcjonalne)</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder='Wprowadź imię i nazwisko'
          placeholderTextColor='#9ca3af'
        />
      </View>

      {/* Email (readonly) */}
      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <View style={[styles.input, styles.inputReadonly]}>
          <Text style={styles.readonlyText}>{userEmail || 'Brak email'}</Text>
        </View>
      </View>

      {/* Weight & Height Row */}
      <View style={styles.row}>
        <View style={[styles.field, styles.fieldHalf]}>
          <Text style={styles.label}>Waga (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder='0'
            placeholderTextColor='#9ca3af'
            keyboardType='decimal-pad'
          />
        </View>

        <View style={[styles.field, styles.fieldHalf]}>
          <Text style={styles.label}>Wzrost (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder='0'
            placeholderTextColor='#9ca3af'
            keyboardType='decimal-pad'
          />
        </View>
      </View>

      {/* Gender */}
      <View style={styles.field}>
        <Text style={styles.label}>Płeć</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              gender === 'male' && styles.segmentButtonActive,
            ]}
            onPress={() => handleGenderChange('male')}
          >
            <IconSymbol
              name='figure.stand'
              size={20}
              color={gender === 'male' ? '#ffffff' : '#6b7280'}
            />
            <Text
              style={[
                styles.segmentText,
                gender === 'male' && styles.segmentTextActive,
              ]}
            >
              Mężczyzna
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              gender === 'female' && styles.segmentButtonActive,
            ]}
            onPress={() => handleGenderChange('female')}
          >
            <IconSymbol
              name='figure.stand.dress'
              size={20}
              color={gender === 'female' ? '#ffffff' : '#6b7280'}
            />
            <Text
              style={[
                styles.segmentText,
                gender === 'female' && styles.segmentTextActive,
              ]}
            >
              Kobieta
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Activity Level */}
      <View style={styles.field}>
        <Text style={styles.label}>Poziom aktywności</Text>
        <View style={styles.activityList}>
          {ACTIVITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.activityItem,
                activityLevel === option.value && styles.activityItemActive,
              ]}
              onPress={() => handleActivityChange(option.value)}
            >
              <IconSymbol
                name={
                  activityLevel === option.value
                    ? 'checkmark.circle.fill'
                    : 'circle'
                }
                size={20}
                color={activityLevel === option.value ? '#5A31F4' : '#d1d5db'}
              />
              <View style={styles.activityInfo}>
                <Text
                  style={[
                    styles.activityLabel,
                    activityLevel === option.value &&
                      styles.activityLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.activityDescription}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          (!hasChanges || isSaving) && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={!hasChanges || isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const ACTIVITY_OPTIONS = [
  {
    value: 'sedentary' as const,
    label: 'Siedzący tryb życia',
    description: 'Brak aktywności fizycznej',
  },
  {
    value: 'light' as const,
    label: 'Lekka aktywność',
    description: '1-3 treningi tygodniowo',
  },
  {
    value: 'moderate' as const,
    label: 'Umiarkowana aktywność',
    description: '3-5 treningów tygodniowo',
  },
  {
    value: 'active' as const,
    label: 'Aktywny',
    description: '6-7 treningów tygodniowo',
  },
  {
    value: 'very_active' as const,
    label: 'Bardzo aktywny',
    description: 'Intensywne treningi codziennie',
  },
]

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  field: {
    marginBottom: 16,
  },
  fieldHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputReadonly: {
    backgroundColor: '#f3f4f6',
  },
  readonlyText: {
    fontSize: 15,
    color: '#6b7280',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#5A31F4',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  activityItemActive: {
    backgroundColor: '#f5f3ff',
    borderColor: '#5A31F4',
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityLabelActive: {
    color: '#5A31F4',
  },
  activityDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#5A31F4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})
