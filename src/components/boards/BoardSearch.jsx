'use client'

import { Input } from '@/components/ui'

export function BoardSearch({ searchQuery, onSearchChange }) {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search boards..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <svg 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
          style={{ color: 'var(--color-muted)' }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  )
}
