import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'
// expose vi globally for tests that mock
// @ts-ignore
globalThis.vi = vi
