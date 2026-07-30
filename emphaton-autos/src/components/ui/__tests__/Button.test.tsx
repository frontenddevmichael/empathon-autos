import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with primary variant by default', () => {
    render(<Button>Click me</Button>)
    const btn = screen.getByRole('button', { name: 'Click me' })
    expect(btn).toBeInTheDocument()
    expect(btn.tagName).toBe('BUTTON')
  })

  it('renders as anchor when as="a"', () => {
    render(<Button as="a" href="/inventory">Browse</Button>)
    const link = screen.getByRole('link', { name: 'Browse' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/inventory')
  })

  it('disables button when loading', () => {
    render(<Button loading>Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('applies sm size class', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toContain('sm')
  })

  it('md is the default size with no extra class', () => {
    render(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button').className).not.toContain('sm')
  })

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full</Button>)
    expect(screen.getByRole('button').className).toContain('full')
  })

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button').className).toContain('secondary')
  })

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button').className).toContain('ghost')
  })
})
