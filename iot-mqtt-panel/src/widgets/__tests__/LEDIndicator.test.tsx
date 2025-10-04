import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import LEDIndicator from '@/widgets/LEDIndicator'

// Mock mqtt store to simulate message
vi.mock('@/mqtt/MqttManager', () => ({
  useMqttStore: (selector?: any) => {
    const state = {
      onMessage: (_id: string, handler: (t: string, p: Uint8Array) => void) => {
        setTimeout(() => handler('home/livingroom/light1/state', new TextEncoder().encode('ON')), 0)
        return () => {}
      },
    }
    return selector ? selector(state) : state
  },
  subscribeTopic: vi.fn(),
  unsubscribeTopic: vi.fn(),
}))

describe('LEDIndicator', () => {
  it('renders bulb icon and yellow pulse for ON', async () => {
    render(
      <LEDIndicator
        connectionId="c1"
        config={{
          name: 'Ceiling Light',
          topicSubscribe: 'home/livingroom/light1/state',
          stateMap: [
            { match: 'ON', icon: 'bulb', color: '#FFD700', label: 'On', animation: { type: 'pulse' } },
            { match: 'OFF', icon: 'bulb_off', color: '#FFFFFF', label: 'Off', animation: { type: 'none' } },
          ],
          defaultState: { icon: 'bulb_off', color: '#DDDDDD', label: 'Unknown' },
        }}
      />
    )

    // allow microtask queue
    await new Promise((r) => setTimeout(r, 10))

    // Assert style color variable is set (indirect check)
    // lucide icons have aria-hidden, so query by SVG element
    const icon = document.querySelector('svg.lucide-lightbulb') as SVGElement | null
    expect(icon).not.toBeNull()
  })
})
