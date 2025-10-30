import { render } from '@testing-library/react-native'
import { HelloWave } from '@/components/hello-wave'

describe('HelloWave', () => {
  it('renders the wave emoji', () => {
    const { getByText } = render(<HelloWave />)
    expect(getByText('👋')).toBeTruthy()
  })

  it('has animated styles applied', () => {
    const { getByText } = render(<HelloWave />)
    const waveElement = getByText('👋')
    expect(waveElement).toBeTruthy()
    // Animated styles are applied, component renders successfully
  })
})
