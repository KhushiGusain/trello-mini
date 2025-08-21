'use client'

export function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-navy)' }}>
        {title}
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        {subtitle}
      </p>
    </div>
  )
}
