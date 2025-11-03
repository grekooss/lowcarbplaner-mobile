/**
 * ShoppingListItem Component
 *
 * Pojedynczy składnik na liście zakupów:
 * - Checkbox do oznaczania jako kupione
 * - Nazwa składnika
 * - Ilość i jednostka
 * - Strike-through style gdy kupione
 * - Haptic feedback przy zaznaczaniu
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { hapticSuccess, hapticLight } from '@src/utils/haptics'
import type { ShoppingListItem as ShoppingListItemType } from '@src/hooks/api/use-shopping-list'

interface ShoppingListItemProps {
  item: ShoppingListItemType
  onTogglePurchased: (ingredientId: number, isPurchased: boolean) => void
}

/**
 * Pojedynczy item na liście zakupów z haptic feedback
 */
export function ShoppingListItem({
  item,
  onTogglePurchased,
}: ShoppingListItemProps) {
  const handleToggle = () => {
    // Different haptic for checking vs unchecking
    if (!item.is_purchased) {
      hapticSuccess() // Success feedback when marking as purchased
    } else {
      hapticLight() // Light feedback when unmarking
    }
    onTogglePurchased(item.ingredient_id, !item.is_purchased)
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleToggle}
      activeOpacity={0.7}
      accessibilityLabel={`${item.ingredient_name}, ${item.total_amount} ${item.unit}`}
      accessibilityRole='checkbox'
      accessibilityState={{ checked: item.is_purchased }}
    >
      {/* Checkbox */}
      <View
        style={[styles.checkbox, item.is_purchased && styles.checkboxChecked]}
      >
        {item.is_purchased && (
          <IconSymbol name='checkmark' size={16} color='#ffffff' />
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text
          style={[styles.name, item.is_purchased && styles.nameStrikethrough]}
          numberOfLines={2}
        >
          {item.ingredient_name}
        </Text>
        <Text
          style={[
            styles.amount,
            item.is_purchased && styles.amountStrikethrough,
          ]}
        >
          {Math.round(item.total_amount * 10) / 10} {item.unit}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  nameStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  amount: {
    fontSize: 13,
    color: '#6b7280',
  },
  amountStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#d1d5db',
  },
})
