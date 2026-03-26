import React from 'react'

export default function Home(){
  return (
    <div>
      <div className="wrap">
        <div className="card">
          <h1>Paperclip</h1>
          <p style={{color:'#9aa7b2'}}>Developer tools and utilities for everyday development tasks.</p>
          <div className="meta">
            <div className="badge">Free tools</div>
            <div className="badge">Privacy-focused</div>
            <div className="badge">No ads</div>
          </div>
          <a className="cta" href="/tools/base64">Try Base64 Tool</a>
          <footer style={{marginTop:18,color:'#9aa7b2',fontSize:13}}>Made with minimal scaffold • Built for developers</footer>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'24px auto',padding:18}}>
        <h2>Developer Tools</h2>
        <p style={{color:'#9aa7b2'}}>Simple, fast, and free web tools for developers.</p>
        
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'16px',marginTop:'24px'}}>
          <a href="/tools/base64" style={{textDecoration:'none',display:'block',padding:'20px',background:'rgba(255,255,255,0.03)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.05)',transition:'all 0.2s',':hover':{background:'rgba(255,255,255,0.05)'}}}>
            <h3 style={{margin:'0 0 8px 0',color:'#e6eef3'}}>Base64 Encoder/Decoder</h3>
            <p style={{margin:0,color:'#9aa7b2',fontSize:'14px'}}>Encode and decode Base64 strings instantly. Useful for APIs, tokens, and data encoding.</p>
          </a>
        </div>
      </div>
    </div>
  )
}
