import { saveNote, loadNote } from './notes'

test('saveNote and loadNote roundtrip in non-browser env', () => {
  // ensure global fallback works
  saveNote('hello')
  expect(loadNote()).toBe('hello')
})
