'use client'

import { Input, Button } from '@/components/ui'

export function AuthForm({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  isLoading, 
  error, 
  submitText,
  children 
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-error)', color: 'white' }}>
          {error}
        </div>
      )}
      
      {children}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : submitText}
      </Button>
    </form>
  )
}
