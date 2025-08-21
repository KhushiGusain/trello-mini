'use client'

import { Input } from '@/components/ui'

export function PasswordInput({ value, onChange, error, placeholder = "Enter your password" }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-navy)' }}>
        Password *
      </label>
      <Input
        type="password"
        placeholder={placeholder}
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
