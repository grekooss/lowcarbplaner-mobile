/**
 * RecipeCard Component
 *
 * Karta przepisu na liście:
 * - Obraz przepisu
 * - Nazwa i kategoria
 * - Makro (kalorie, białko, węgle, tłuszcze)
 * - Czas przygotowania
 * - Animacje wejścia i interakcji
 */

import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
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

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity)

interface RecipeCardProps {
  recipe: Tables<'recipes'>
  onPress?: (recipeId: number) => void
  index?: number
}

/**
 * Karta przepisu na liście z animacjami
 */
export function RecipeCard({ recipe, onPress, index = 0 }: RecipeCardProps) {
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
        style={[styles.pressableContainer, animatedStyle] as any}
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
        </View>

        {/* Info sekcja */}
        <View style={styles.info}>
          {/* Nazwa przepisu */}
          <Text style={styles.name} numberOfLines={2}>
            {recipe.name}
          </Text>

          {/* Makro */}
          <View style={styles.macros}>
            <MacroCard
              icon='flame.fill'
              value={Math.round(recipe.total_calories || 0)}
              unit='kcal'
              backgroundColor='#f3f4f6'
            />
            <MacroCard
              icon='drop.fill'
              value={Math.round(recipe.total_fats_g || 0)}
              unit='g'
              backgroundColor='#dcfce7'
            />
            <MacroCard
              icon='leaf.fill'
              value={Math.round(recipe.total_carbs_g || 0)}
              unit='g'
              backgroundColor='#fef9c3'
            />
            <MacroCard
              icon='scalemass.fill'
              value={Math.round(recipe.total_protein_g || 0)}
              unit='g'
              backgroundColor='#fed7aa'
            />
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  )
}

/**
 * Kolorowa karta makroskładnika
 */
function MacroCard({
  icon,
  value,
  unit,
  backgroundColor,
}: {
  icon: string
  value: number
  unit: string
  backgroundColor: string
}) {
  return (
    <View style={[styles.macroCard, { backgroundColor }]}>
      <View style={styles.macroIconContainer}>
        <IconSymbol name={icon as any} size={20} color='#1f2937' />
      </View>
      <Text style={styles.macroValue}>
        {value} <Text style={styles.macroUnit}>{unit}</Text>
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
  pressableContainer: {
    width: '100%',
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
    gap: 8,
    marginTop: 8,
  },
  macroCard: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  macroIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  macroUnit: {
    fontSize: 11,
    fontWeight: '600',
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
