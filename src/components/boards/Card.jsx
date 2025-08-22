'use client'

export default function Card({
  card,
  cardIndex,
  listId,
  editingCardId,
  editingText,
  setEditingText,
  onStartEditCard,
  onSaveCardTitle,
  onCancelEditCard,
  onDeleteCard,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onOpenCardModal
}) {
  const isEditing = editingCardId === card.id

  return (
    <div key={card.id}>
      <div 
        className="h-0.5 bg-transparent transition-all duration-200 drop-zone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, 'card', null, listId, cardIndex)}
      />
      
      <div 
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md transition-shadow cursor-pointer group"
        data-card-id={card.id}
        draggable
        onDragStart={(e) => {
          e.stopPropagation()
          onDragStart(e, 'card', card.id, listId)
        }}
        onDragOver={(e) => {
          e.stopPropagation()
          onDragOver(e)
        }}
        onDrop={(e) => {
          e.stopPropagation()
          onDrop(e, 'card', card.id, listId, cardIndex)
        }}
        onDragEnd={(e) => {
          e.stopPropagation()
          onDragEnd(e)
        }}
        onClick={() => onOpenCardModal(card, listId)}
      >
        {isEditing ? (
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveCardTitle(card.id)
              if (e.key === 'Escape') onCancelEditCard()
            }}
            onBlur={() => onSaveCardTitle(card.id)}
            className="w-full px-2 py-1 text-sm border border-[#3a72ee] rounded focus:outline-none focus:ring-2 focus:ring-[#3a72ee]"
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between">
            <h4 className="text-[#0c2144] font-medium text-sm leading-tight flex-1">
              {card.title}
            </h4>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                className="text-[#6b7a90] hover:text-[#3a72ee] p-1 rounded hover:bg-blue-50 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onStartEditCard(card.id, card.title)
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                className="text-[#6b7a90] hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteCard(listId, card.id)
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
