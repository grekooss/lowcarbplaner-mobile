/**
 * RecipeFilters Component
 *
 * Filtrowanie przepisów:
 * - Search bar (nazwa przepisu)
 * - Kategorie (horizontal scroll chips)
 * - Szybkie filtry (Low Carb, High Protein)
 * - Advanced filters modal (makro ranges)
 */

import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'
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
  const [searchText, setSearchText] = useState(filters.search || '')

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search: searchText })
  }

  const handleCategorySelect = (category: string) => {
    const newCategory = filters.category === category ? undefined : category
    onFiltersChange({ ...filters, category: newCategory })
  }

  const handleToggleLowCarb = () => {
    onFiltersChange({ ...filters, isLowCarb: !filters.isLowCarb })
  }

  const handleClearFilters = () => {
    setSearchText('')
    onFiltersChange({})
  }

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.isLowCarb ||
    filters.maxCalories ||
    filters.maxCarbs ||
    filters.minProtein

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name='magnifyingglass' size={20} color='#6b7280' />
        <TextInput
          style={styles.searchInput}
          placeholder='Szukaj przepisu...'
          placeholderTextColor='#9ca3af'
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType='search'
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <IconSymbol name='xmark.circle.fill' size={20} color='#9ca3af' />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        <TouchableOpacity
          style={[
            styles.quickFilterChip,
            filters.isLowCarb && styles.quickFilterChipActive,
          ]}
          onPress={handleToggleLowCarb}
        >
          <IconSymbol
            name='leaf'
            size={16}
            color={filters.isLowCarb ? '#ffffff' : '#10b981'}
          />
          <Text
            style={[
              styles.quickFilterText,
              filters.isLowCarb && styles.quickFilterTextActive,
            ]}
          >
            Low Carb
          </Text>
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFilters}
          >
            <IconSymbol
              name='arrow.counterclockwise'
              size={16}
              color='#ef4444'
            />
            <Text style={styles.clearButtonText}>Wyczyść</Text>
          </TouchableOpacity>
        )}
      </View>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 8,
  },
  quickFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  quickFilterChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
  quickFilterTextActive: {
    color: '#ffffff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
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
