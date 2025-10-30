import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { forwardRef, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface ExampleBottomSheetProps {
  title?: string
  children?: React.ReactNode
}

/**
 * Przykładowy komponent Bottom Sheet
 *
 * @example
 * ```tsx
 * const bottomSheetRef = useRef<BottomSheet>(null)
 *
 * // Otwórz sheet
 * bottomSheetRef.current?.expand()
 *
 * // Zamknij sheet
 * bottomSheetRef.current?.close()
 *
 * <ExampleBottomSheet ref={bottomSheetRef} title="Filtruj">
 *   <Text>Zawartość Bottom Sheet</Text>
 * </ExampleBottomSheet>
 * ```
 */
export const ExampleBottomSheet = forwardRef<
  BottomSheet,
  ExampleBottomSheetProps
>(({ title = 'Bottom Sheet', children }, ref) => {
  // Snap points - miejsca, w których sheet może się zatrzymać
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], [])

  return (
    <BottomSheet
      ref={ref}
      index={-1} // Start zamknięty (-1 = closed)
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.content}>{children}</View>
      </BottomSheetView>
    </BottomSheet>
  )
})

ExampleBottomSheet.displayName = 'ExampleBottomSheet'

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  indicator: {
    backgroundColor: '#ddd',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
})
