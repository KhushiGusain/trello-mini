'use client'

export default function Card({
  card,
  cardIndex,
  listId,
  onDeleteCard,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onOpenCardModal
}) {
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
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 px-3 py-2">
            <h4 className="text-sm font-medium text-[#0c2144] truncate">
              {card.title}
            </h4>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
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
      </div>
    </div>
  )
}
