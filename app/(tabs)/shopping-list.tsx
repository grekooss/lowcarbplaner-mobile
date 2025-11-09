/**
 * Shopping List Screen
 *
 * Lista zakupów:
 * - Wybór zakresu dat (domyślnie: cały tydzień)
 * - Grupowanie po kategoriach
 * - Zaznaczanie kupionych produktów
 * - Czyszczenie listy
 */

import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { format, startOfWeek, endOfWeek } from 'date-fns'

// Komponenty
import { CategorySection } from '@src/components/shopping-list/category-section'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { ProtectedScreen } from '@src/components/auth/protected-screen'

// Hooki
import {
  useShoppingList,
  useTogglePurchased,
} from '@src/hooks/api/use-shopping-list'

export default function ShoppingListScreen() {
  // Domyślny zakres: cały bieżący tydzień (Pon-Niedz)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

  const [startDate] = useState(format(weekStart, 'yyyy-MM-dd'))
  const [endDate] = useState(format(weekEnd, 'yyyy-MM-dd'))

  // Queries & Mutations
  const {
    data: shoppingList,
    isLoading,
    refetch,
  } = useShoppingList(startDate, endDate)
  const togglePurchased = useTogglePurchased()

  const handleTogglePurchased = (
    ingredientId: number,
    isPurchased: boolean
  ) => {
    togglePurchased.mutate({ ingredientId, isPurchased, startDate, endDate })
  }

  const handleRefresh = async () => {
    await refetch()
  }

  // Stats
  const totalItems =
    shoppingList?.reduce((sum, cat) => sum + cat.items.length, 0) || 0
  const purchasedItems =
    shoppingList?.reduce(
      (sum, cat) => sum + cat.items.filter((item) => item.is_purchased).length,
      0
    ) || 0

  return (
    <ProtectedScreen
      placeholder={
        <SafeAreaView
          style={styles.container}
          edges={['left', 'right', 'bottom']}
        >
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>Lista Zakupów</Text>
            <Text style={styles.placeholderMessage}>
              Zaloguj się, aby zobaczyć swoją listę zakupów
            </Text>
          </View>
        </SafeAreaView>
      }
    >
      <SafeAreaView
        style={styles.container}
        edges={['left', 'right', 'bottom']}
      >
        {/* Progress bar */}
        {totalItems > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(purchasedItems / totalItems) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {purchasedItems} / {totalItems} produktów
            </Text>
          </View>
        )}

        {/* Shopping List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#5A31F4' />
          </View>
        ) : !shoppingList || shoppingList.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name='cart' size={64} color='#d1d5db' />
            <Text style={styles.emptyText}>Brak produktów na liście</Text>
            <Text style={styles.emptySubtext}>
              Dodaj posiłki do swojego planu, aby wygenerować listę zakupów
            </Text>
          </View>
        ) : (
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
            {shoppingList.map((category) => (
              <CategorySection
                key={category.category}
                category={category}
                onTogglePurchased={handleTogglePurchased}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </ProtectedScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
