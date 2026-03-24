import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { greet } from './utils/hello'

function App(){
  const [message, setMessage] = useState('')

  function onSayHi(){
    setMessage(greet('Paperclip'))
  }

  return (
    <div className="wrap" style={{padding:48}}>
      <div className="card">
        <h1>Paperclip (React)</h1>
        <p style={{color:'#9aa7b2'}}>Interactive demo mounted from <code>src/main.jsx</code>.</p>
        <div style={{marginTop:12}}>
          <button onClick={onSayHi} style={{padding:'8px 12px',borderRadius:8,border:'none',background:'#06b6d4',color:'#012',fontWeight:700}}>Say hi</button>
        </div>
        {message && <p style={{marginTop:12,fontWeight:600}}>{message}</p>}
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
