import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// jsdom localStorage mock (일부 환경에서 메서드가 누락되는 문제 해결)
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
