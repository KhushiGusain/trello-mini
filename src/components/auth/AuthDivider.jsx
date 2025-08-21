'use client'

export function AuthDivider({ text = "or" }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--color-border)]" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white" style={{ color: 'var(--color-muted)' }}>
          {text}
        </span>
      </div>
    </div>
  )
}
