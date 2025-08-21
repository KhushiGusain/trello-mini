'use client'

export function AuthContainer({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy)' }}>
            Mini Trello
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
