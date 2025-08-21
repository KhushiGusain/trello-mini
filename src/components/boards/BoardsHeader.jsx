'use client'

export function BoardsHeader() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-navy)' }}>
        Your Boards
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        Organize your work and collaborate with your team
      </p>
    </div>
  )
}
