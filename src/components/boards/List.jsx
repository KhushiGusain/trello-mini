'use client'

import { useState } from 'react'
import Card from './Card'
import AddCardButton from './AddCardButton'

export default function List({ 
  list, 
  listIndex,
  editingListId,
  editingText,
  setEditingText,
  onStartEditList,
  onSaveListTitle,
  onCancelEditList,
  onDeleteList,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onCreateCard,
  onOpenCardModal,
  editingCardId,
  onStartEditCard,
  onSaveCardTitle,
  onCancelEditCard,
  onDeleteCard
}) {
  const isEditing = editingListId === list.id

  return (
    <div 
      className="w-64 flex-shrink-0"
      draggable
      onDragStart={(e) => {
        e.stopPropagation()
        onDragStart(e, 'list', list.id)
      }}
      onDragOver={(e) => {
        e.stopPropagation()
        onDragOver(e)
      }}
      onDragLeave={(e) => {
        e.stopPropagation()
        onDragLeave(e)
      }}
      onDrop={(e) => {
        e.stopPropagation()
        onDrop(e, 'list', list.id)
      }}
      onDragEnd={(e) => {
        e.stopPropagation()
        onDragEnd(e)
      }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveListTitle(list.id)
                      if (e.key === 'Escape') onCancelEditList()
                    }}
                    onBlur={() => onSaveListTitle(list.id)}
                    className="flex-1 px-2 py-1 text-sm border border-[#3a72ee] rounded focus:outline-none focus:ring-2 focus:ring-[#3a72ee]"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 
                    className="text-[#0c2144] font-bold text-base cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    onClick={() => onStartEditList(list.id, list.title)}
                  >
                    {list.title}
                  </h3>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button 
                className="text-[#6b7a90] hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                onClick={() => onDeleteList(list.id)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-1 space-y-0.5">
          {list.cards.length === 0 ? (
            <div 
              className="h-8 bg-transparent transition-all duration-200 drop-zone border-2 border-dashed border-gray-200 rounded-lg"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, 'card', null, list.id, 0)}
            />
          ) : (
            <>
              <div 
                className="h-1 bg-transparent transition-all duration-200 drop-zone"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, 'card', null, list.id, 0)}
              />
              
              {list.cards.map((card, cardIndex) => (
                <Card
                  key={card.id}
                  card={card}
                  cardIndex={cardIndex}
                  listId={list.id}
                  editingCardId={editingCardId}
                  editingText={editingText}
                  setEditingText={setEditingText}
                  onStartEditCard={onStartEditCard}
                  onSaveCardTitle={onSaveCardTitle}
                  onCancelEditCard={onCancelEditCard}
                  onDeleteCard={onDeleteCard}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  onOpenCardModal={onOpenCardModal}
                />
              ))}
              
              <div 
                className="h-1 bg-transparent transition-all duration-200 drop-zone"
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, 'card', null, list.id, list.cards.length)}
              />
            </>
          )}
        </div>
        
        <div className="px-1 pb-1">
          <AddCardButton listId={list.id} onCreateCard={onCreateCard} />
        </div>
      </div>
    </div>
  )
}
