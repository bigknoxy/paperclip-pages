const KEY = 'paperclip.note'

export function saveNote(note) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KEY, note)
      return
    }
  } catch (e) {
    // ignore
  }
  // fallback for non-browser environments (tests)
  global.__PAPERCLIP_NOTE = note
}

export function loadNote() {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(KEY) || ''
    }
  } catch (e) {
    // ignore
  }
  return global.__PAPERCLIP_NOTE || ''
}
