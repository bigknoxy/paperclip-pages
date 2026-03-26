import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import Base64Tool from './Base64Tool'

describe('Base64Tool', () => {
  it('renders encode/decode tool', () => {
    render(<Base64Tool />)
    expect(screen.getByText('Base64 Encoder / Decoder')).toBeInTheDocument()
    expect(screen.getByText('Encode to Base64')).toBeInTheDocument()
  })

  it('encodes text to base64', () => {
    render(<Base64Tool />)
    const textarea = screen.getByPlaceholderText('Enter text to encode...')
    fireEvent.change(textarea, { target: { value: 'hello' } })
    expect(screen.getByText('aGVsbG8=')).toBeInTheDocument()
  })

  it('switches to decode mode', () => {
    render(<Base64Tool />)
    const decodeBtn = screen.getByText('Decode from Base64')
    fireEvent.click(decodeBtn)
    expect(screen.getByPlaceholderText('Enter Base64 string...')).toBeInTheDocument()
  })

  it('decodes base64 to text', () => {
    render(<Base64Tool />)
    const decodeBtn = screen.getByText('Decode from Base64')
    fireEvent.click(decodeBtn)
    const textarea = screen.getByPlaceholderText('Enter Base64 string...')
    fireEvent.change(textarea, { target: { value: 'aGVsbG8=' } })
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('shows error for invalid base64', () => {
    render(<Base64Tool />)
    const decodeBtn = screen.getByText('Decode from Base64')
    fireEvent.click(decodeBtn)
    const textarea = screen.getByPlaceholderText('Enter Base64 string...')
    fireEvent.change(textarea, { target: { value: 'not-valid-base64!!!' } })
    expect(screen.getByText('Invalid Base64 string')).toBeInTheDocument()
  })

  it('clears input and output', () => {
    render(<Base64Tool />)
    const textarea = screen.getByPlaceholderText('Enter text to encode...')
    fireEvent.change(textarea, { target: { value: 'hello' } })
    const clearBtn = screen.getByText('Clear')
    fireEvent.click(clearBtn)
    expect(textarea.value).toBe('')
    expect(screen.getByText('Result will appear here...')).toBeInTheDocument()
  })
})
