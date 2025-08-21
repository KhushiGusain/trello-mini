'use client'

import { Input } from '@/components/ui'

export function EmailInput({ value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-navy)' }}>
        Email *
      </label>
      <Input
        type="email"
        placeholder="Enter your email"
        value={value}
        onChange={onChange}
        required
        className={error ? 'border-[var(--color-error)]' : ''}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
