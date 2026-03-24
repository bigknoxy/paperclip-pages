import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { greet } from './utils/hello'
import { saveNote, loadNote } from './utils/notes'
import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Demo from './pages/Demo'

function App(){
  const [message, setMessage] = useState('')
  const [note, setNote] = useState(loadNote())

  function onSayHi(){
    setMessage(greet('Paperclip'))
  }

  function onSaveNote(){
    saveNote(note)
    setMessage('Saved note')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
