import React, { useState } from 'react'
import { saveNote, loadNote } from '../utils/notes'

export default function Demo(){
  const [note, setNote] = useState(loadNote())
  const [status, setStatus] = useState('')

  function onSave(){
    saveNote(note)
    setStatus('Saved')
    setTimeout(()=>setStatus(''),1200)
  }

  return (
    <div style={{maxWidth:900,margin:'24px auto',padding:18}}>
      <h1>Demo: Notes</h1>
      <p style={{color:'#9aa7b2'}}>Type a note and save it to localStorage.</p>
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <input value={note} onChange={(e)=>setNote(e.target.value)} style={{flex:1,padding:8,borderRadius:8,border:'1px solid rgba(255,255,255,0.06)'}} />
        <button onClick={onSave} style={{padding:'8px 12px',borderRadius:8,background:'#06b6d4',border:'none',fontWeight:700}}>Save</button>
      </div>
      {status && <div style={{marginTop:12,fontWeight:600}}>{status}</div>}
    </div>
  )
}
