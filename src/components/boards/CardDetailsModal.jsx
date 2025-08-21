'use client'

import { useState, useEffect, useRef } from 'react'

export default function CardDetailsModal({ isOpen, onClose, card, listTitle, onUpdateCard }) {
  const [description, setDescription] = useState(card?.description || '')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(card?.title || '')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [commentText, setCommentText] = useState('')
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!isOpen || !card) return null

  const handleSaveDescription = () => {
    if (onUpdateCard) {
      onUpdateCard(card.id, { ...card, description: description.trim() })
    }
    setIsEditingDescription(false)
  }

  const handleSaveTitle = () => {
    if (title.trim() && onUpdateCard) {
      onUpdateCard(card.id, { ...card, title: title.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleClose = () => {
    setIsEditingDescription(false)
    setIsEditingTitle(false)
    setActiveDropdown(null)
    onClose()
  }

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleAddComment = () => {
    if (commentText.trim()) {
      setCommentText('')
    }
  }

  const labels = [
    { id: 1, name: 'Bug', color: 'bg-red-500' },
    { id: 2, name: 'Feature', color: 'bg-blue-500' },
    { id: 3, name: 'Enhancement', color: 'bg-green-500' },
    { id: 4, name: 'Documentation', color: 'bg-yellow-500' }
  ]

  const assignees = [
    { id: 1, name: 'John Doe', initials: 'JD', color: 'bg-blue-500' },
    { id: 2, name: 'Jane Smith', initials: 'JS', color: 'bg-green-500' },
    { id: 3, name: 'Mike Johnson', initials: 'MJ', color: 'bg-purple-500' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-1 transition-colors">
                <span>{listTitle}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle()
                        if (e.key === 'Escape') setIsEditingTitle(false)
                      }}
                      onBlur={handleSaveTitle}
                      className="w-full text-2xl font-bold text-gray-900 border-none outline-none bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <h1 
                      className="text-2xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {card.title}
                    </h1>
                  )}
                </div>
              </div>


              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add</span>
                </button>
                <button 
                  onClick={() => toggleDropdown('labels')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors relative"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Labels</span>
                  {activeDropdown === 'labels' && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 min-w-[200px]">
                      <div className="space-y-2">
                        {labels.map(label => (
                          <div key={label.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <div className={`w-4 h-4 ${label.color} rounded`}></div>
                            <span className="text-sm">{label.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
                <button 
                  onClick={() => toggleDropdown('dates')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors relative"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Dates</span>
                  {activeDropdown === 'dates' && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 min-w-[200px]">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">Dec 15, 2024</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm">Add due date</span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
                <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Checklist</span>
                </button>
                <button 
                  onClick={() => toggleDropdown('members')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors relative"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Members</span>
                  {activeDropdown === 'members' && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 min-w-[200px]">
                      <div className="space-y-2">
                        {assignees.map(assignee => (
                          <div key={assignee.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <div className={`w-6 h-6 ${assignee.color} rounded-full flex items-center justify-center`}>
                              <span className="text-xs text-white font-medium">{assignee.initials}</span>
                            </div>
                            <span className="text-sm">{assignee.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              </div>

       
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                </div>
                
                {isEditingDescription ? (
                  <div className="space-y-3">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a more detailed description..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="4"
                      autoFocus
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveDescription}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingDescription(false)
                          setDescription(card?.description || '')
                        }}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="bg-gray-50 rounded-lg p-4 min-h-[80px] cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {description ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Add a more detailed description...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Comments and activity</h3>
                </div>
                <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                  Show details
                </button>
              </div>


              <div className="space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white font-medium">KG</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">khushi gusain</span> added this card to <span className="font-medium">{listTitle}</span>
                    </p>
                    <button className="text-xs text-gray-500 hover:text-gray-700 mt-1">
                      2 hours ago
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
