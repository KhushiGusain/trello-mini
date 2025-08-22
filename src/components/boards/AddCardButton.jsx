'use client'

import { useState } from 'react'

export default function AddCardButton({ listId, onCreateCard }) {
  const [showInput, setShowInput] = useState(false)
  const [cardTitle, setCardTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateCard = async () => {
    if (cardTitle.trim() && !isCreating) {
      setIsCreating(true)
      try {
        await onCreateCard(listId, cardTitle)
        setCardTitle('')
        setShowInput(false)
      } finally {
        setIsCreating(false)
      }
    }
  }

  if (showInput) {
    return (
      <div className="px-2 pb-2">
        <input
          type="text"
          placeholder="Enter card title..."
          value={cardTitle}
          onChange={(e) => setCardTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isCreating) handleCreateCard()
            if (e.key === 'Escape') setShowInput(false)
          }}
          onBlur={handleCreateCard}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a72ee] mb-3"
          autoFocus
          disabled={isCreating}
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateCard}
            disabled={isCreating || !cardTitle.trim()}
            className="px-4 py-2 bg-[#3a72ee] text-white text-sm font-medium rounded-lg hover:bg-[#2456f1] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          >
            {isCreating ? 'Creating...' : 'Add card'}
          </button>
          <button
            onClick={() => setShowInput(false)}
            disabled={isCreating}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button 
      className="w-full text-left text-[#3a72ee] hover:text-[#2456f1] hover:bg-[#e8f0ff] py-3 px-3 rounded-lg transition-colors font-medium text-sm cursor-pointer"
      onClick={() => setShowInput(true)}
    >
      + Add a card
    </button>
  )
}
