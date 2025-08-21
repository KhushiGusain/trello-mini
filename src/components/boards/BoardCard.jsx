'use client'

export function BoardCard({ board, onBoardClick, onDeleteBoard }) {
  return (
    <div className="group cursor-pointer">
      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all duration-200 relative">
        <div 
          className="h-20 w-full"
          style={{ backgroundColor: board.backgroundColor }}
        />
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 
                className="font-semibold text-base mb-1 truncate" 
                style={{ color: 'var(--color-navy)' }}
                onClick={() => onBoardClick(board.id)}
              >
                {board.title}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {board.workspace} • {board.visibility}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteBoard(board)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded cursor-pointer"
              title="Delete board"
            >
              <svg className="w-4 h-4" style={{ color: 'var(--color-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
