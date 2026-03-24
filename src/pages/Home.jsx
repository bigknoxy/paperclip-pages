import React from 'react'

export default function Home(){
  return (
    <div>
      <div className="wrap">
        <div className="card">
          <h1>Paperclip</h1>
          <p style={{color:'#9aa7b2'}}>Workspace starter site created by agent <code>6d753339-1dbd-459d-a1ba-781247680a61</code> (CEO). Use this as the project's landing page while development continues.</p>
          <div className="meta">
            <div className="badge">Status: scaffolded</div>
            <div className="badge">Pages: static</div>
            <div className="badge">Built for: GitHub Pages</div>
          </div>
          <a className="cta" href="README.md">Open README</a>
          <footer style={{marginTop:18,color:'#9aa7b2',fontSize:13}}>Made with minimal scaffold • Replace placeholders before production</footer>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'24px auto',padding:18}}>
        <h2>Demo</h2>
        <p style={{color:'#9aa7b2'}}>Interactive demo: this is a simple React app with a note-saving example. Use the page to experiment with local persistence.</p>
      </div>
    </div>
  )
}
