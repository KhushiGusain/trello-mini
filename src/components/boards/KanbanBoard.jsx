'use client'

import { useState } from 'react'
import CardDetailsModal from './CardDetailsModal'

export default function KanbanBoard({ lists, onListsChange }) {
  const [editingListId, setEditingListId] = useState(null)
  const [editingCardId, setEditingCardId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [showAddList, setShowAddList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [draggedCard, setDraggedCard] = useState(null)
  const [draggedList, setDraggedList] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const startEditList = (listId, currentTitle) => {
    setEditingListId(listId)
    setEditingText(currentTitle)
  }

  const saveListTitle = (listId) => {
    if (editingText.trim()) {
      const updatedLists = lists.map(list => 
        list.id === listId ? { ...list, title: editingText.trim() } : list
      )
      onListsChange(updatedLists)
    }
    setEditingListId(null)
    setEditingText('')
  }

  const cancelEditList = () => {
    setEditingListId(null)
    setEditingText('')
  }

  const createList = () => {
    if (newListTitle.trim()) {
      const newList = {
        id: Date.now().toString(),
        title: newListTitle.trim(),
        position: lists.length + 1,
        cards: []
      }
      onListsChange([...lists, newList])
      setNewListTitle('')
      setShowAddList(false)
    }
  }

  const deleteList = (listId) => {
    onListsChange(lists.filter(list => list.id !== listId))
  }

  const reorderList = (fromIndex, toIndex) => {
    const newLists = [...lists]
    const [movedList] = newLists.splice(fromIndex, 1)
    newLists.splice(toIndex, 0, movedList)
    
    const updatedLists = newLists.map((list, index) => ({
      ...list,
      position: index + 1
    }))
    
    onListsChange(updatedLists)
  }

  const startEditCard = (cardId, currentTitle) => {
    setEditingCardId(cardId)
    setEditingText(currentTitle)
  }

  const saveCardTitle = (cardId) => {
    if (editingText.trim()) {
      const updatedLists = lists.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, title: editingText.trim() } : card
        )
      }))
      onListsChange(updatedLists)
    }
    setEditingCardId(null)
    setEditingText('')
  }

  const cancelEditCard = () => {
    setEditingCardId(null)
    setEditingText('')
  }

  const createCard = (listId, title) => {
    if (title.trim()) {
      const newCard = {
        id: Date.now().toString(),
        title: title.trim(),
        position: lists.find(l => l.id === listId).cards.length + 1
      }
      
      const updatedLists = lists.map(list => 
        list.id === listId 
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      )
      onListsChange(updatedLists)
    }
  }

  const deleteCard = (listId, cardId) => {
    const updatedLists = lists.map(list => 
      list.id === listId 
        ? { ...list, cards: list.cards.filter(card => card.id !== cardId) }
        : list
    )
    onListsChange(updatedLists)
  }

  const moveCard = (fromListId, toListId, cardId, newPosition) => {
    const newLists = [...lists]
    
    const fromList = newLists.find(l => l.id === fromListId)
    const toList = newLists.find(l => l.id === toListId)
    
    if (!fromList || !toList) return
    
    const card = fromList.cards.find(c => c.id === cardId)
    if (!card) return
    
    const updatedFromList = {
      ...fromList,
      cards: fromList.cards.filter(c => c.id !== cardId)
    }
    
    const targetCards = [...toList.cards]
    if (newPosition === 0) {
      targetCards.unshift(card)
    } else if (newPosition >= targetCards.length) {
      targetCards.push(card)
    } else {
      targetCards.splice(newPosition, 0, card)
    }
    
    const updatedTargetCards = targetCards.map((c, index) => ({
      ...c,
      position: index + 1
    }))
    
    const updatedToList = {
      ...toList,
      cards: updatedTargetCards
    }
    
    const updatedSourceCards = updatedFromList.cards.map((c, index) => ({
      ...c,
      position: index + 1
    }))
    
    const finalFromList = {
      ...updatedFromList,
      cards: updatedSourceCards
    }
    
    const finalLists = newLists.map(list => {
      if (list.id === fromListId) return finalFromList
      if (list.id === toListId) return updatedToList
      return list
    })
    
    onListsChange(finalLists)
  }

  const reorderCard = (listId, fromIndex, toIndex) => {
    const updatedLists = lists.map(list => {
      if (list.id !== listId) return list
      
      const newCards = [...list.cards]
      const [movedCard] = newCards.splice(fromIndex, 1)
      newCards.splice(toIndex, 0, movedCard)
      
      const updatedCards = newCards.map((card, index) => ({
        ...card,
        position: index + 1
      }))
      
      return { ...list, cards: updatedCards }
    })
    
    onListsChange(updatedLists)
  }

  const handleDragStart = (e, type, id, listId = null) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, id, listId }))
    
    if (type === 'card') {
      setDraggedCard({ id, listId })
      e.target.style.opacity = '0.5'
      e.target.style.transform = 'rotate(2deg)'
      e.target.style.zIndex = '1000'
    } else if (type === 'list') {
      setDraggedList({ id })
      e.target.style.opacity = '0.5'
      e.target.style.transform = 'rotate(2deg)'
      e.target.style.zIndex = '1000'
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (e.target.classList.contains('drop-zone')) {
      e.target.style.backgroundColor = '#e8f0ff'
      if (e.target.classList.contains('border-dashed')) {
        e.target.style.borderColor = '#3a72ee'
        e.target.style.borderWidth = '2px'
      } else {
        e.target.style.borderColor = '#3a72ee'
      }
    }
  }

  const handleDragLeave = (e) => {
    if (e.target.classList.contains('drop-zone')) {
      e.target.style.backgroundColor = 'transparent'
      if (e.target.classList.contains('border-dashed')) {
        e.target.style.borderColor = '#e5e7eb'
      } else {
        e.target.style.borderColor = 'transparent'
      }
    }
  }

  const handleDrop = (e, type, targetId, targetListId = null, position = null) => {
    e.preventDefault()
    
    if (e.target.classList.contains('drop-zone')) {
      e.target.style.backgroundColor = 'transparent'
      if (e.target.classList.contains('border-dashed')) {
        e.target.style.borderColor = '#e5e7eb'
      } else {
        e.target.style.borderColor = 'transparent'
      }
    }
    
    try {
      if (type === 'card' && draggedCard) {
        if (draggedCard.listId === targetListId) {
          const fromIndex = lists.find(l => l.id === draggedCard.listId).cards.findIndex(c => c.id === draggedCard.id)
          const toIndex = position || 0
          if (fromIndex !== toIndex) {
            reorderCard(draggedCard.listId, fromIndex, toIndex)
          }
        } else {
          moveCard(draggedCard.listId, targetListId, draggedCard.id, position || 0)
        }
      } else if (type === 'list' && draggedList) {
        const fromIndex = lists.findIndex(l => l.id === draggedList.id)
        const toIndex = lists.findIndex(l => l.id === targetId)
        if (fromIndex !== toIndex) {
          reorderList(fromIndex, toIndex)
        }
      }
    } catch (error) {
      console.error('Error in drag and drop:', error)
    }
    
    setDraggedCard(null)
    setDraggedList(null)
    
    if (e.target.style) {
      e.target.style.opacity = '1'
      e.target.style.transform = 'none'
      e.target.style.zIndex = 'auto'
    }
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    e.target.style.transform = 'none'
    e.target.style.zIndex = 'auto'
    setDraggedCard(null)
    setDraggedList(null)
  }

  const openCardModal = (card, listTitle) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const closeCardModal = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
  }

  const updateCard = (cardId, updatedCard) => {
    const updatedLists = lists.map(list => ({
      ...list,
      cards: list.cards.map(card => 
        card.id === cardId ? { ...card, ...updatedCard } : card
      )
    }))
    onListsChange(updatedLists)
  }

  return (
    <div className="flex-1 p-6 bg-[#eff1f1] overflow-x-auto custom-scrollbar">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
      
      <div className="flex space-x-4 min-w-max pb-2">
        {lists.map((list, listIndex) => (
          <div 
            key={list.id}
            className="w-64 flex-shrink-0"
            draggable
            onDragStart={(e) => {
              e.stopPropagation()
              handleDragStart(e, 'list', list.id)
            }}
            onDragOver={(e) => {
              e.stopPropagation()
              handleDragOver(e)
            }}
            onDragLeave={(e) => {
              e.stopPropagation()
              handleDragLeave(e)
            }}
            onDrop={(e) => {
              e.stopPropagation()
              handleDrop(e, 'list', list.id)
            }}
            onDragEnd={(e) => {
              e.stopPropagation()
              handleDragEnd(e)
            }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-3 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingListId === list.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveListTitle(list.id)
                            if (e.key === 'Escape') cancelEditList()
                          }}
                          onBlur={() => saveListTitle(list.id)}
                          className="flex-1 px-2 py-1 text-sm border border-[#3a72ee] rounded focus:outline-none focus:ring-2 focus:ring-[#3a72ee]"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h3 
                          className="text-[#0c2144] font-bold text-base cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                          onClick={() => startEditList(list.id, list.title)}
                        >
                          {list.title}
                        </h3>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      className="text-[#6b7a90] hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                      onClick={() => deleteList(list.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-1 space-y-0.5">
                <div 
                  className={`${list.cards.length === 0 ? 'h-8' : 'h-1'} bg-transparent transition-all duration-200 drop-zone ${list.cards.length === 0 ? 'border-2 border-dashed border-gray-200 rounded-lg' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'card', null, list.id, 0)}
                />
                
                {list.cards.map((card, cardIndex) => (
                  <div key={card.id}>
                    <div 
                      className="h-0.5 bg-transparent transition-all duration-200 drop-zone"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'card', null, list.id, cardIndex)}
                    />
                    
                    <div 
                      className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md transition-shadow cursor-pointer group"
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation()
                        handleDragStart(e, 'card', card.id, list.id)
                      }}
                      onDragOver={(e) => {
                        e.stopPropagation()
                        handleDragOver(e)
                      }}
                      onDrop={(e) => {
                        e.stopPropagation()
                        handleDrop(e, 'card', card.id, list.id, cardIndex)
                      }}
                      onDragEnd={(e) => {
                        e.stopPropagation()
                        handleDragEnd(e)
                      }}
                      onClick={() => openCardModal(card, list.title)}
                    >
                      {editingCardId === card.id ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveCardTitle(card.id)
                            if (e.key === 'Escape') cancelEditCard()
                          }}
                          onBlur={() => saveCardTitle(card.id)}
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
                                startEditCard(card.id, card.title)
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
                                deleteCard(list.id, card.id)
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
                ))}
                
                <div 
                  className={`${list.cards.length === 0 ? 'h-8' : 'h-1'} bg-transparent transition-all duration-200 drop-zone ${list.cards.length === 0 ? 'border-2 border-dashed border-gray-200 rounded-lg' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'card', null, list.id, list.cards.length)}
                />
              </div>
              
              <div className="px-1 pb-1">
                <AddCardButton listId={list.id} onCreateCard={createCard} />
              </div>
            </div>
          </div>
        ))}
        
        {showAddList ? (
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border-2 border-[#3a72ee] p-4">
              <input
                type="text"
                placeholder="Enter list title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createList()
                  if (e.key === 'Escape') setShowAddList(false)
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a72ee] mb-3"
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={createList}
                  className="px-4 py-2 bg-[#3a72ee] text-white text-sm font-medium rounded-lg hover:bg-[#2456f1] transition-colors"
                >
                  Add list
                </button>
                <button
                  onClick={() => setShowAddList(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-64 flex-shrink-0">
            <div 
              className="bg-white rounded-xl border-2 border-dashed border-[#3a72ee] p-4 flex items-center justify-center hover:bg-[#e8f0ff] transition-colors cursor-pointer group"
              onClick={() => setShowAddList(true)}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#2456f1] transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-[#3a72ee] font-medium text-sm group-hover:text-[#2456f1] transition-colors">Add List</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <CardDetailsModal
        isOpen={isModalOpen}
        onClose={closeCardModal}
        card={selectedCard}
        listTitle={selectedCard ? lists.find(list => list.cards.some(card => card.id === selectedCard.id))?.title : ''}
        onUpdateCard={updateCard}
      />
    </div>
  )
}

function AddCardButton({ listId, onCreateCard }) {
  const [showInput, setShowInput] = useState(false)
  const [cardTitle, setCardTitle] = useState('')

  const handleCreateCard = () => {
    if (cardTitle.trim()) {
      onCreateCard(listId, cardTitle)
      setCardTitle('')
      setShowInput(false)
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
            if (e.key === 'Enter') handleCreateCard()
            if (e.key === 'Escape') setShowInput(false)
          }}
          onBlur={handleCreateCard}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a72ee] mb-3"
          autoFocus
        />
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateCard}
            className="px-4 py-2 bg-[#3a72ee] text-white text-sm font-medium rounded-lg hover:bg-[#2456f1] transition-colors"
          >
            Add card
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
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
