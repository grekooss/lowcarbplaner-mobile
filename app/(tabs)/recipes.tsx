/**
 * Recipes Screen
 *
 * Lista wszystkich przepisów:
 * - Wyszukiwanie
 * - Filtry (kategorie, Low Carb)
 * - Podgląd przepisu
 */

import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Komponenty
import { RecipeCard } from '@src/components/recipes/recipe-card'
import { RecipeFilters } from '@src/components/recipes/recipe-filters'

// Hooki
import {
  useRecipes,
  useRecipeCategories,
  type RecipeFilters as RecipeFiltersType,
} from '@src/hooks/api/use-recipes'

export default function RecipesScreen() {
  const [filters, setFilters] = useState<RecipeFiltersType>({})

  // Queries
  const { data: recipes, isLoading, refetch } = useRecipes(filters)
  const { data: categories } = useRecipeCategories()

  const handleRecipePress = (recipeId: number) => {
    // TODO: Nawiguj do Recipe Detail Modal/Screen
    console.log('Recipe pressed:', recipeId)
  }

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Filters */}
      <RecipeFilters
        filters={filters}
        categories={categories || []}
        onFiltersChange={setFilters}
      />

      {/* Recipes List */}
      {isLoading && !recipes ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#5A31F4' />
        </View>
      ) : (
        <FlatList
          data={recipes || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <RecipeCard
              recipe={item}
              onPress={handleRecipePress}
              index={index}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Brak przepisów spełniających kryteria
              </Text>
              <Text style={styles.emptySubtext}>
                Spróbuj zmienić filtry wyszukiwania
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
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
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
})
