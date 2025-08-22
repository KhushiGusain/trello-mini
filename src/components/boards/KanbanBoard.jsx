'use client'

import { useState } from 'react'
import CardDetailsModal from './CardDetailsModal'
import List from './List'
import AddListButton from './AddListButton'

export default function KanbanBoard({ 
  lists, 
  onListsChange,
  onCreateList,
  onUpdateList,
  onDeleteList,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onUpdateCardsOrder,
  boardId,
  boardLabels = [],
  boardMembers = [],
  onGetCardComments,
  onAddCardComment,
  onGetCardLabels,
  onAddCardLabel,
  onRemoveCardLabel,
  onGetCardAssignees,
  onAddCardAssignee,
  onRemoveCardAssignee,
  onRefreshBoardLabels
}) {
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

  const saveListTitle = async (listId) => {
    if (editingText.trim()) {
      try {
        await onUpdateList(listId, editingText.trim())
      } catch (error) {
        console.error('Error updating list:', error)
      }
    }
    setEditingListId(null)
    setEditingText('')
  }

  const cancelEditList = () => {
    setEditingListId(null)
    setEditingText('')
  }

  const createList = async () => {
    if (newListTitle.trim()) {
      try {
        await onCreateList(newListTitle.trim())
        setNewListTitle('')
        setShowAddList(false)
      } catch (error) {
        console.error('Error creating list:', error)
      }
    }
  }

  const deleteList = async (listId) => {
    try {
      await onDeleteList(listId)
    } catch (error) {
      console.error('Error deleting list:', error)
    }
  }

  const reorderList = async (fromIndex, toIndex) => {
    const newLists = [...lists]
    const [movedList] = newLists.splice(fromIndex, 1)
    newLists.splice(toIndex, 0, movedList)
    
    const updatedLists = newLists.map((list, index) => ({
      ...list,
      position: index + 1
    }))
    
    try {
      await onListsChange(updatedLists)
    } catch (error) {
      console.error('Error reordering lists:', error)
    }
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

  const createCard = async (listId, title) => {
    if (title.trim()) {
      try {
        await onCreateCard(listId, title.trim())
      } catch (error) {
        console.error('Error creating card:', error)
      }
    }
  }

  const deleteCard = async (listId, cardId) => {
    try {
      await onDeleteCard(listId, cardId)
    } catch (error) {
      console.error('Error deleting card:', error)
    }
  }

  const moveCard = async (fromListId, toListId, cardId, newPosition) => {
    console.log('Moving card:', cardId, 'from list:', fromListId, 'to list:', toListId, 'at position:', newPosition)
    
    const newLists = [...lists]
    
    const fromList = newLists.find(l => l.id === fromListId)
    const toList = newLists.find(l => l.id === toListId)
    
    if (!fromList || !toList) {
      console.error('Source or target list not found')
      return
    }
    
    const card = fromList.cards.find(c => c.id === cardId)
    if (!card) {
      console.error('Card not found in source list')
      return
    }
    
    const updatedFromList = {
      ...fromList,
      cards: fromList.cards.filter(c => c.id !== cardId)
    }
    
    const targetCards = [...toList.cards]
    const movedCard = { ...card, list_id: toListId }
    
    if (newPosition === 0) {
      targetCards.unshift(movedCard)
    } else if (newPosition >= targetCards.length) {
      targetCards.push(movedCard)
    } else {
      targetCards.splice(newPosition, 0, movedCard)
    }
    
    const updatedTargetCards = targetCards.map((c, index) => ({
      ...c,
      position: (index + 1) * 1000,
      list_id: toListId
    }))
    
    const updatedToList = {
      ...toList,
      cards: updatedTargetCards
    }
    
    const updatedSourceCards = updatedFromList.cards.map((c, index) => ({
      ...c,
      position: (index + 1) * 1000,
      list_id: fromListId
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
    
    console.log('Final lists for update:', finalLists)
    
    try {
      await onUpdateCardsOrder(finalLists)
    } catch (error) {
      console.error('Error moving card:', error)
    }
  }

  const reorderCard = async (listId, fromIndex, toIndex) => {
    console.log('Reordering card in list:', listId, 'from index:', fromIndex, 'to index:', toIndex)
    
    const updatedLists = lists.map(list => {
      if (list.id !== listId) return list
      
      const newCards = [...list.cards]
      const [movedCard] = newCards.splice(fromIndex, 1)
      newCards.splice(toIndex, 0, movedCard)
      
      const updatedCards = newCards.map((card, index) => ({
        ...card,
        position: (index + 1) * 1000,
        list_id: listId
      }))
      
      return { ...list, cards: updatedCards }
    })
    
    console.log('Updated lists for reordering:', updatedLists)
    
    try {
      await onUpdateCardsOrder(updatedLists)
    } catch (error) {
      console.error('Error reordering cards:', error)
    }
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
      const dragData = e.dataTransfer.getData('text/plain')
      let parsedData = null
      
      if (dragData) {
        try {
          parsedData = JSON.parse(dragData)
        } catch (parseError) {
          console.error('Error parsing drag data:', parseError)
        }
      }
      
      if (type === 'card' && draggedCard) {
        console.log('Dropping card:', draggedCard, 'to list:', targetListId, 'at position:', position)
        
        if (draggedCard.listId === targetListId) {
          const fromIndex = lists.find(l => l.id === draggedCard.listId).cards.findIndex(c => c.id === draggedCard.id)
          const toIndex = position || 0
          console.log('Reordering card from index:', fromIndex, 'to index:', toIndex)
          if (fromIndex !== toIndex) {
            reorderCard(draggedCard.listId, fromIndex, toIndex)
          }
        } else {
          console.log('Moving card to different list')
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

  const updateCard = async (cardId, updates) => {
    try {
      const updatedCard = await onUpdateCard(cardId, updates)
      
      const updatedLists = lists.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, ...updatedCard } : card
        )
      }))
      
      if (selectedCard && selectedCard.id === cardId) {
        setSelectedCard({ ...selectedCard, ...updatedCard })
      }
      
      onListsChange(updatedLists)
    } catch (error) {
      console.error('Error updating card:', error)
    }
  }

  const updateCardData = (cardId, updates) => {
    const updatedLists = lists.map(list => ({
      ...list,
      cards: list.cards.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      )
    }))
    
    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard({ ...selectedCard, ...updates })
    }
    
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
          <List
            key={list.id}
            list={list}
            listIndex={listIndex}
            editingListId={editingListId}
            editingText={editingText}
            setEditingText={setEditingText}
            onStartEditList={startEditList}
            onSaveListTitle={saveListTitle}
            onCancelEditList={cancelEditList}
            onDeleteList={deleteList}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onCreateCard={createCard}
            onOpenCardModal={openCardModal}
            editingCardId={editingCardId}
            onStartEditCard={startEditCard}
            onSaveCardTitle={saveCardTitle}
            onCancelEditCard={cancelEditCard}
            onDeleteCard={deleteCard}
          />
        ))}
        
        <AddListButton
          showAddList={showAddList}
          setShowAddList={setShowAddList}
          newListTitle={newListTitle}
          setNewListTitle={setNewListTitle}
          createList={createList}
        />
      </div>
      
      <CardDetailsModal
        isOpen={isModalOpen}
        onClose={closeCardModal}
        card={selectedCard}
        listTitle={selectedCard ? lists.find(list => list.cards.some(card => card.id === selectedCard.id))?.title : ''}
        onUpdateCard={updateCard}
        boardId={boardId}
        boardLabels={boardLabels || []}
        boardMembers={boardMembers || []}
        getCardComments={onGetCardComments}
        addCardComment={onAddCardComment}
        getCardLabels={onGetCardLabels}
        addCardLabel={onAddCardLabel}
        removeCardLabel={onRemoveCardLabel}
        getCardAssignees={onGetCardAssignees}
        addCardAssignee={onAddCardAssignee}
        removeCardAssignee={onRemoveCardAssignee}
        onRefreshBoardLabels={onRefreshBoardLabels}
        onCardUpdate={updateCardData}
      />
    </div>
  )
}
