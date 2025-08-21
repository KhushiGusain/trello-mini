'use client'

export function CreateBoardCard({ onClick }) {
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="bg-white rounded-lg border-2 border-dashed border-[var(--color-border)] hover:bg-[var(--color-hover)] hover:border-[var(--color-primary)] transition-all duration-200 h-full min-h-[140px] flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-navy)' }}>
          Create new board
        </p>
      </div>
    </div>
  )
}
