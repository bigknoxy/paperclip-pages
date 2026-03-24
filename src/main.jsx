import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { greet } from './utils/hello'
import { saveNote, loadNote } from './utils/notes'

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
    <div className="wrap" style={{padding:48}}>
      <div className="card">
        <h1>Paperclip (React)</h1>
        <p style={{color:'#9aa7b2'}}>Interactive demo mounted from <code>src/main.jsx</code>.</p>
        <div style={{marginTop:12}}>
          <button onClick={onSayHi} style={{padding:'8px 12px',borderRadius:8,border:'none',background:'#06b6d4',color:'#012',fontWeight:700,marginRight:8}}>Say hi</button>
          <input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Type a note" style={{padding:'8px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',marginRight:8}} />
          <button onClick={onSaveNote} style={{padding:'8px 12px',borderRadius:8,border:'none',background:'#4ade80',color:'#012',fontWeight:700}}>Save note</button>
        </div>
        {message && <p style={{marginTop:12,fontWeight:600}}>{message}</p>}
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
