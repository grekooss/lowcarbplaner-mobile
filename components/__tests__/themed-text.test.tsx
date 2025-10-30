import { render } from '@testing-library/react-native'
import { ThemedText } from '@/components/themed-text'

describe('ThemedText', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>)
    expect(getByText('Hello World')).toBeTruthy()
  })

  it('applies custom type prop', () => {
    const { getByText } = render(
      <ThemedText type='title'>Title Text</ThemedText>
    )
    expect(getByText('Title Text')).toBeTruthy()
  })

  it('renders with custom style', () => {
    const { getByText } = render(
      <ThemedText style={{ fontSize: 20 }}>Styled Text</ThemedText>
    )
    const textElement = getByText('Styled Text')
    expect(textElement).toBeTruthy()
  })

  it('passes accessibility props correctly', () => {
    const { getByLabelText } = render(
      <ThemedText accessibilityLabel='test-label'>Accessible Text</ThemedText>
    )
    expect(getByLabelText('test-label')).toBeTruthy()
  })
})
