/**
 * CategorySection Component
 *
 * Sekcja kategorii na liście zakupów:
 * - Nagłówek kategorii z licznikiem
 * - Lista składników w kategorii
 * - Collapse/expand funkcjonalność
 */

import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { ShoppingListItem } from './shopping-list-item'
import type { ShoppingListByCategory } from '@src/hooks/api/use-shopping-list'

interface CategorySectionProps {
  category: ShoppingListByCategory
  onTogglePurchased: (ingredientId: number, isPurchased: boolean) => void
}

/**
 * Sekcja kategorii z collapse
 */
export function CategorySection({
  category,
  onTogglePurchased,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const purchasedCount = category.items.filter(
    (item) => item.is_purchased
  ).length
  const totalCount = category.items.length

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <IconSymbol
            name={isExpanded ? 'chevron.down' : 'chevron.right'}
            size={20}
            color='#6b7280'
          />
          <Text style={styles.categoryName}>{category.category}</Text>
        </View>
        <Text style={styles.counter}>
          {purchasedCount}/{totalCount}
        </Text>
      </TouchableOpacity>

      {/* Items List */}
      {isExpanded && (
        <View style={styles.itemsList}>
          {category.items.map((item) => (
            <ShoppingListItem
              key={item.ingredient_id}
              item={item}
              onTogglePurchased={onTogglePurchased}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  counter: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  itemsList: {
    paddingVertical: 4,
  },
})
