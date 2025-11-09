/**
 * Profile Screen
 *
 * Profil użytkownika:
 * - Edycja danych osobowych
 * - Wyświetlanie i edycja celów makro
 * - Generowanie nowego planu
 * - Wylogowanie
 */

import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { hapticSuccess, hapticWarning, hapticMedium } from '@src/utils/haptics'

// Komponenty
import { ProfileForm } from '@src/components/profile/profile-form'
import { MacroTargetsCard } from '@src/components/profile/macro-targets-card'
import { ProtectedScreen } from '@src/components/auth/protected-screen'

// Hooki
import {
  useProfile,
  useUpdateProfile,
  useGeneratePlan,
} from '@src/hooks/api/use-profile'
import { useAuth } from '@src/hooks/useAuth'
import type { Tables } from '@src/types/database.types'

export default function ProfileScreen() {
  const [isEditingMacros, setIsEditingMacros] = useState(false)

  // Queries & Mutations
  const { data: profile, isLoading, refetch } = useProfile()
  const updateProfile = useUpdateProfile()
  const generatePlan = useGeneratePlan()
  const { user, logout } = useAuth()

  const handleProfileSave = (data: Partial<Tables<'profiles'>>) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        hapticSuccess()
        Toast.show({
          type: 'success',
          text1: 'Profil zaktualizowany',
          text2: 'Twoje dane zostały zapisane',
        })
      },
    })
  }

  const handleGeneratePlan = () => {
    hapticMedium()
    Alert.alert(
      'Generuj nowy plan',
      'Czy na pewno chcesz wygenerować nowy plan posiłków na tydzień? Obecny plan zostanie zastąpiony.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Generuj',
          style: 'default',
          onPress: () => {
            hapticMedium()
            generatePlan.mutate()
          },
        },
      ]
    )
  }

  const handleLogout = () => {
    hapticWarning()
    Alert.alert('Wyloguj się', 'Czy na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyloguj',
        style: 'destructive',
        onPress: () => {
          hapticMedium()
          logout()
        },
      },
    ])
  }

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <ProtectedScreen
      placeholder={
        <SafeAreaView
          style={styles.container}
          edges={['left', 'right', 'bottom']}
        >
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>Profil</Text>
            <Text style={styles.placeholderMessage}>
              Zaloguj się, aby zarządzać swoim profilem i ustawieniami
            </Text>
          </View>
        </SafeAreaView>
      }
    >
      {isLoading || !profile ? (
        <SafeAreaView
          style={styles.container}
          edges={['left', 'right', 'bottom']}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#5A31F4' />
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView
          style={styles.container}
          edges={['left', 'right', 'bottom']}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
              />
            }
          >
            {/* Macro Targets Card */}
            <View style={styles.section}>
              <MacroTargetsCard
                profile={profile}
                onEdit={() => setIsEditingMacros(!isEditingMacros)}
              />
            </View>

            {/* Profile Form */}
            <View style={styles.section}>
              <ProfileForm
                profile={profile}
                userEmail={user?.email}
                onSave={handleProfileSave}
                isSaving={updateProfile.isPending}
              />
            </View>

            {/* Actions */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGeneratePlan}
                disabled={generatePlan.isPending}
              >
                <IconSymbol name='sparkles' size={20} color='#5A31F4' />
                <Text style={styles.actionButtonText}>
                  {generatePlan.isPending
                    ? 'Generowanie...'
                    : 'Generuj nowy plan na tydzień'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={handleLogout}
              >
                <IconSymbol
                  name='rectangle.portrait.and.arrow.right'
                  size={20}
                  color='#ef4444'
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    styles.actionButtonTextDanger,
                  ]}
                >
                  Wyloguj się
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </ProtectedScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonDanger: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5A31F4',
  },
  actionButtonTextDanger: {
    color: '#ef4444',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  placeholderMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
})
