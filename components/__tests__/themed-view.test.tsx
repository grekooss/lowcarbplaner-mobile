import { render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { ThemedView } from '@/components/themed-view'

describe('ThemedView', () => {
  it('renders correctly with children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Child Content</Text>
      </ThemedView>
    )
    expect(getByText('Child Content')).toBeTruthy()
  })

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <ThemedView testID='themed-view' style={{ padding: 20 }}>
        <Text>Test</Text>
      </ThemedView>
    )
    expect(getByTestId('themed-view')).toBeTruthy()
  })

  it('renders without children', () => {
    const { toJSON } = render(<ThemedView testID='empty-view' />)
    expect(toJSON()).toBeTruthy()
  })
})
