'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui'

export default function BoardPage({ params }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p style={{ color: 'var(--color-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p style={{ color: 'var(--color-muted)' }}>Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <header className="bg-white border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => router.push('/boards')}
            >
              ← Back to Boards
            </Button>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-navy)' }}>
              Board {id}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {user?.user_metadata?.name || user?.email}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-hover)] flex items-center justify-center">
            <svg className="w-12 h-12" style={{ color: 'var(--color-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-navy)' }}>
            Board Detail Page
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
            kanban board
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Board ID: {id}
          </p>
        </div>
      </main>
    </div>
  )
}
