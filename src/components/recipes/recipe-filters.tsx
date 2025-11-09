/**
 * RecipeFilters Component
 *
 * Filtrowanie przepisów:
 * - Kategorie (horizontal scroll chips)
 */

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import type { RecipeFilters as RecipeFiltersType } from '@src/hooks/api/use-recipes'

interface RecipeFiltersProps {
  filters: RecipeFiltersType
  categories: string[]
  onFiltersChange: (filters: RecipeFiltersType) => void
}

/**
 * Komponenty filtrowania przepisów
 */
export function RecipeFilters({
  filters,
  categories,
  onFiltersChange,
}: RecipeFiltersProps) {
  const handleCategorySelect = (category: string) => {
    const newCategory = filters.category === category ? undefined : category
    onFiltersChange({ ...filters, category: newCategory })
  }

  return (
    <View style={styles.container}>
      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Kategorie</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  filters.category === category && styles.categoryChipActive,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    filters.category === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#5A31F4',
    borderColor: '#5A31F4',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
})
