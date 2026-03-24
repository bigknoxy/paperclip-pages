import { greet } from './hello'

describe('greet', () => {
  test('returns greeting with provided name', () => {
    expect(greet('Paperclip')).toBe('Hello, Paperclip!')
  })

  test('defaults to "world" when no name provided', () => {
    expect(greet()).toBe('Hello, world!')
  })

  test('handles empty string as name', () => {
    expect(greet('')).toBe('Hello, !')
  })
})
