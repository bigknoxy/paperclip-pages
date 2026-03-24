import { greet } from './hello'

test('greet returns greeting with provided name', () => {
  expect(greet('Paperclip')).toBe('Hello, Paperclip!')
})
