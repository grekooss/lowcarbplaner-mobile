/**
 * RecipeCard Component
 *
 * Karta przepisu na liście:
 * - Obraz przepisu
 * - Nazwa i kategoria
 * - Makro (kalorie, białko, węgle, tłuszcze)
 * - Czas przygotowania
 * - Badge "Low Carb" jeśli < 20g węgli
 * - Animacje wejścia i interakcji
 */

import { View, Text, StyleSheet, Image } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated'
import type { Tables } from '@src/types/database.types'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { hapticLight } from '@src/utils/haptics'

const AnimatedPressable = Animated.createAnimatedComponent(
  require('react-native').TouchableOpacity
)

interface RecipeCardProps {
  recipe: Tables<'recipes'>
  onPress?: (recipeId: number) => void
  index?: number
}

/**
 * Karta przepisu na liście z animacjami
 */
export function RecipeCard({ recipe, onPress, index = 0 }: RecipeCardProps) {
  const isLowCarb = (recipe.total_carbs_g || 0) < 20
  const scale = useSharedValue(1)
  const shadowOpacity = useSharedValue(0.1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 300 })
    shadowOpacity.value = withTiming(0.15, { duration: 100 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
    shadowOpacity.value = withTiming(0.1, { duration: 100 })
  }

  const handlePress = () => {
    hapticLight()
    onPress?.(recipe.id)
  }

  // Staggered entrance animation
  const entering = FadeInDown.delay(index * 50)
    .duration(300)
    .springify()
    .damping(20)
    .stiffness(200)

  return (
    <Animated.View entering={entering} style={styles.container}>
      <AnimatedPressable
        style={animatedStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        accessibilityLabel={`Przepis: ${recipe.name}`}
      >
        {/* Obraz przepisu */}
        <View style={styles.imageContainer}>
          {recipe.image_url ? (
            <Image
              source={{ uri: recipe.image_url }}
              style={styles.image}
              resizeMode='cover'
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <IconSymbol name='fork.knife' size={32} color='#9ca3af' />
            </View>
          )}

          {/* Low Carb Badge */}
          {isLowCarb && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Low Carb</Text>
            </View>
          )}
        </View>

        {/* Info sekcja */}
        <View style={styles.info}>
          {/* Kategoria */}
          {recipe.category && (
            <Text style={styles.category} numberOfLines={1}>
              {recipe.category}
            </Text>
          )}

          {/* Nazwa przepisu */}
          <Text style={styles.name} numberOfLines={2}>
            {recipe.name}
          </Text>

          {/* Makro */}
          <View style={styles.macros}>
            <MacroItem
              icon='flame'
              value={Math.round(recipe.total_calories || 0)}
              unit='kcal'
              color='#111827'
            />
            <MacroItem
              icon='figure.strengthtraining.traditional'
              value={Math.round(recipe.total_protein_g || 0)}
              unit='B'
              color='#10b981'
            />
            <MacroItem
              icon='leaf'
              value={Math.round(recipe.total_carbs_g || 0)}
              unit='W'
              color='#f59e0b'
            />
            <MacroItem
              icon='drop'
              value={Math.round(recipe.total_fats_g || 0)}
              unit='T'
              color='#ef4444'
            />
          </View>

          {/* Czas przygotowania */}
          {recipe.preparation_time_minutes && (
            <View style={styles.timeRow}>
              <IconSymbol name='clock' size={14} color='#6b7280' />
              <Text style={styles.timeText}>
                {recipe.preparation_time_minutes} min
              </Text>
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  )
}

/**
 * Mini makro item z ikoną
 */
function MacroItem({
  icon,
  value,
  unit,
  color,
}: {
  icon: string
  value: number
  unit: string
  color: string
}) {
  return (
    <View style={styles.macroItem}>
      <IconSymbol name={icon} size={14} color={color} />
      <Text style={[styles.macroValue, { color }]}>
        {value}
        <Text style={styles.macroUnit}> {unit}</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  info: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5A31F4',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
  macros: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  macroUnit: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#6b7280',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
})
