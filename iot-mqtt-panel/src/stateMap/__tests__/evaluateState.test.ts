import { describe, it, expect } from 'vitest'
import { evaluateState } from '@/utils/stateMap'

describe('evaluateState', () => {
  it('matches string exact case-insensitive', () => {
    const res = evaluateState('ON', [{ match: 'on', icon: 'bulb', color: '#ff0' }], { defaultState: { icon: 'bulb_off', color: '#fff' } })
    expect(res.matchedRule?.icon).toBe('bulb')
  })

  it('matches regex literal', () => {
    const res = evaluateState('abc', [{ match: '/^a.*/' } as any], { defaultState: { label: 'Unknown' } })
    expect(res.matchedRule).toBeTruthy()
  })

  it('numeric comparison works', () => {
    const res = evaluateState('42', [{ match: 42, label: 'ok' }], { defaultState: { label: 'Unknown' } })
    expect(res.matchedRule?.label).toBe('ok')
  })

  it('jsonPath extraction', () => {
    const res = evaluateState('{"state":"ON"}', [{ match: 'ON', label: 'on' }], { parseAsJson: true, jsonPath: '$.state', defaultState: { label: 'Unknown' } })
    expect(res.matchedRule?.label).toBe('on')
  })
})
