import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Demo from './Demo'

test('renders demo and saves note', () => {
  render(<Demo />)
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: 'hello' } })
  const button = screen.getByRole('button', { name: /save/i })
  fireEvent.click(button)
  expect(screen.getByText(/Saved/i)).toBeInTheDocument()
})
