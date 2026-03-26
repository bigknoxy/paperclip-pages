import React, { useState, useEffect } from 'react'

function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encode')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    handleConvert()
  }, [input, mode])

  function handleConvert() {
    setError('')
    setCopied(false)
    
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      if (mode === 'encode') {
        setOutput(btoa(input))
      } else {
        setOutput(atob(input))
      }
    } catch (e) {
      setError(mode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed')
      setOutput('')
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClear() {
    setInput('')
    setOutput('')
    setError('')
  }

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '0 0 8px 0',
      color: '#e6eef3'
    },
    subtitle: {
      color: '#9aa7b2',
      margin: '0'
    },
    modeSwitch: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px'
    },
    modeBtn: (active) => ({
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      background: active ? '#06b6d4' : 'rgba(255,255,255,0.1)',
      color: active ? '#012' : '#e6eef3'
    }),
    textarea: {
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(255,255,255,0.05)',
      color: '#e6eef3',
      fontSize: '14px',
      fontFamily: 'monospace',
      resize: 'vertical',
      boxSizing: 'border-box',
      marginBottom: '12px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#9aa7b2',
      fontSize: '14px',
      fontWeight: '500'
    },
    output: {
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(6, 182, 212, 0.05)',
      color: '#e6eef3',
      fontSize: '14px',
      fontFamily: 'monospace',
      overflowWrap: 'break-word',
      boxSizing: 'border-box'
    },
    error: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '8px'
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginTop: '16px',
      flexWrap: 'wrap'
    },
    btn: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      background: '#06b6d4',
      color: '#012'
    },
    btnSecondary: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.2)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      background: 'transparent',
      color: '#e6eef3'
    },
    copied: {
      color: '#22c55e',
      fontSize: '14px',
      marginLeft: '12px',
      alignSelf: 'center'
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Base64 Encoder / Decoder</h1>
        <p style={styles.subtitle}>Free online tool to encode and decode Base64 strings instantly</p>
      </header>

      <div style={styles.modeSwitch}>
        <button
          style={styles.modeBtn(mode === 'encode')}
          onClick={() => setMode('encode')}
        >
          Encode to Base64
        </button>
        <button
          style={styles.modeBtn(mode === 'decode')}
          onClick={() => setMode('decode')}
        >
          Decode from Base64
        </button>
      </div>

      <div>
        <label style={styles.label}>
          {mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
        </label>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string...'}
        />
      </div>

      <div>
        <label style={styles.label}>Result</label>
        <div style={styles.output}>
          {output || 'Result will appear here...'}
        </div>
        {error && <div style={styles.error}>{error}</div>}
      </div>

      <div style={styles.actions}>
        <button style={styles.btn} onClick={handleCopy} disabled={!output}>
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button style={styles.btnSecondary} onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  )
}

export default Base64Tool
