import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach } from 'vitest'
import { LandingPage } from '../pages/LandingPage'
import { useAuthStore } from '../hooks/useAuthStore'

describe('LandingPage component', () => {
  beforeEach(() => {
    // Reset state
    useAuthStore.setState({ user: null })
  })

  it('renders landing page with correct brand title', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    // Check title presence
    const brandTitles = screen.getAllByText('ztasks')
    expect(brandTitles.length).toBeGreaterThan(0)
    expect(screen.getByText('Tu segundo cerebro.', { exact: false })).toBeInTheDocument()
  })

  it('forces light theme styling', () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    // Check that the root div has 'bg-surface-50' class
    const rootDiv = container.firstChild as HTMLElement
    expect(rootDiv.className).toContain('bg-surface-50')
  })

  it('shows appropriate link when user is not authenticated', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    // Should show "Comenzar gratis"
    expect(screen.getByText('Comenzar gratis')).toBeInTheDocument()

    // Redirection should lead to '/auth'
    const comenzarLinks = screen.getAllByRole('link', { name: /comenzar gratis/i })
    expect(comenzarLinks[0].getAttribute('href')).toBe('/auth')
  })

  it('shows appropriate link when user is authenticated', () => {
    // Authenticate user
    useAuthStore.setState({ user: { id: 'user-123', email: 'test@example.com' } })

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    // Should show "Comenzar gratis"
    expect(screen.getByText('Comenzar gratis')).toBeInTheDocument()

    // Redirection should lead to '/dashboard'
    const comenzarLinks = screen.getAllByRole('link', { name: /comenzar gratis/i })
    expect(comenzarLinks[0].getAttribute('href')).toBe('/dashboard')
  })
})
