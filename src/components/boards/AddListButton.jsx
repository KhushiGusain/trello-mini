'use client'

import { useState } from 'react'

export default function AddListButton({ showAddList, setShowAddList, newListTitle, setNewListTitle, createList }) {
  const handleCreateList = async (e) => {
    e.preventDefault()
    if (!newListTitle.trim()) return

    const listTitle = newListTitle.trim()
    setNewListTitle('')
    setShowAddList(false)

    try {
      await createList(listTitle)
    } catch (error) {
      console.error('Error creating list:', error)
    }
  }

  const handleCancel = () => {
    setNewListTitle('')
    setShowAddList(false)
  }

  if (showAddList) {
    return (
      <div className="w-64 flex-shrink-0">
        <div className="bg-white rounded-xl border-2 border-[#3a72ee] p-4">
          <input
            type="text"
            placeholder="Enter list title..."
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateList(e)
              if (e.key === 'Escape') handleCancel()
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a72ee] mb-3 truncate"
            autoFocus
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateList}
              disabled={!newListTitle.trim()}
              className="px-4 py-2 bg-[#3a72ee] text-white text-sm font-medium rounded-lg hover:bg-[#2456f1] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            >
              Add list
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
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
  )
}
