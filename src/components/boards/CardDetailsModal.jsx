'use client'

import { useState, useEffect, useRef } from 'react'

export default function CardDetailsModal({ 
  isOpen, 
  onClose, 
  card, 
  listTitle, 
  onUpdateCard,
  boardId,
  boardLabels = [],
  boardMembers = [],
  getCardComments,
  addCardComment,
  getCardLabels,
  addCardLabel,
  removeCardLabel,
  getCardAssignees,
  addCardAssignee,
  removeCardAssignee,
  onRefreshBoardLabels,
  onCardUpdate
}) {
  const [description, setDescription] = useState(card?.description || '')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(card?.title || '')
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [cardLabels, setCardLabels] = useState([])
  const [cardAssignees, setCardAssignees] = useState([])
  const [dueDate, setDueDate] = useState(card?.due_date || null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [labelTitle, setLabelTitle] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [isCreatingLabel, setIsCreatingLabel] = useState(false)
  const modalRef = useRef(null)
  const membersDropdownRef = useRef(null)
  const labelsDropdownRef = useRef(null)

  const predefinedColors = [
    { name: 'Red', color: '#ef4444' },
    { name: 'Orange', color: '#f97316' },
    { name: 'Yellow', color: '#eab308' },
    { name: 'Green', color: '#22c55e' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Purple', color: '#8b5cf6' },
    { name: 'Pink', color: '#ec4899' },
    { name: 'Gray', color: '#6b7280' }
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setActiveDropdown(null)
        return
      }
      
      if (activeDropdown) {
        let dropdownElement = null
        if (activeDropdown === 'members') {
          dropdownElement = membersDropdownRef.current
        } else if (activeDropdown === 'labels') {
          dropdownElement = labelsDropdownRef.current
        }
        
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          const dropdownButton = event.target.closest(`[data-dropdown="${activeDropdown}"]`)
          if (!dropdownButton) {
            setActiveDropdown(null)
          }
        } else if (!dropdownElement) {
          const dropdownButton = event.target.closest(`[data-dropdown="${activeDropdown}"]`)
          if (!dropdownButton) {
            setActiveDropdown(null)
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, activeDropdown])

  useEffect(() => {
    if (isOpen && card) {
      console.log('Card prop received:', card)
      console.log('Card description:', card.description)
      console.log('Card due_date:', card.due_date)
      console.log('Card labels:', card.labels)
      console.log('Card assignees:', card.assignees)
      console.log('Card comments:', card.comments)
      
      setDescription(card.description || '')
      setTitle(card.title || '')
      setDueDate(card.due_date || null)
      
      setComments(card.comments || [])
      setCardLabels(card.labels || [])
      setCardAssignees(card.assignees || [])
    }
  }, [isOpen, card])

  if (!isOpen || !card) return null

  const handleSaveDescription = async () => {
    if (onUpdateCard) {
      try {
        console.log('Saving description:', description.trim())
        await onUpdateCard(card.id, { description: description.trim() })
        setIsEditingDescription(false)
        console.log('Description saved successfully')
      } catch (error) {
        console.error('Error saving description:', error)
      }
    }
  }

  const handleSaveTitle = async () => {
    if (title.trim() && onUpdateCard) {
      try {
        await onUpdateCard(card.id, { title: title.trim() })
        setIsEditingTitle(false)
      } catch (error) {
        console.error('Error saving title:', error)
      }
    }
  }

  const handleSaveDueDate = async (newDate) => {
    if (onUpdateCard) {
      try {
        console.log('Saving due date:', newDate)
        await onUpdateCard(card.id, { due_date: newDate })
        setDueDate(newDate)
        setIsDatePickerOpen(false)
        console.log('Due date saved successfully')
      } catch (error) {
        console.error('Error saving due date:', error)
      }
    }
  }

  const handleRemoveDueDate = async () => {
    if (onUpdateCard) {
      try {
        await onUpdateCard(card.id, { due_date: null })
        setDueDate(null)
        setIsDatePickerOpen(false)
      } catch (error) {
        console.error('Error removing due date:', error)
      }
    }
  }

  const handleClose = () => {
    setIsEditingDescription(false)
    setIsEditingTitle(false)
    setActiveDropdown(null)
    setIsDatePickerOpen(false)
    setCommentText('')
    setComments([])
    setCardLabels([])
    setCardAssignees([])
    setDueDate(null)
    onClose()
  }

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const handleAddComment = async () => {
    if (commentText.trim()) {
      try {
        console.log('Adding comment:', commentText.trim())
        const newComment = await addCardComment(card.id, commentText.trim())
        console.log('Comment added successfully:', newComment)
        const updatedComments = [...comments, newComment]
        setComments(updatedComments)
        setCommentText('')
        
        if (onCardUpdate) {
          onCardUpdate(card.id, { comments: updatedComments })
        }
      } catch (error) {
        console.error('Error adding comment:', error)
      }
    }
  }

  const handleAddLabel = async (colorName, colorValue, customTitle = null) => {
    try {
      setIsCreatingLabel(true)
      
      // Use the color name as the label name if no custom title is provided
      const labelName = customTitle || colorName
      console.log('handleAddLabel called with:', { colorName, colorValue, customTitle, labelName })
      
      let existingLabel = null
      if (!customTitle) {
        existingLabel = boardLabels.find(label => label.color_hex === colorValue)
      }
      
      if (!existingLabel) {
        const response = await fetch(`/api/boards/${boardId}/labels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: labelName, 
            color: colorValue 
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create label')
        }

        existingLabel = await response.json()
        console.log('Created new label:', existingLabel)
        
        if (onRefreshBoardLabels) {
          await onRefreshBoardLabels()
        }
      }
      
      const newLabel = await addCardLabel(card.id, existingLabel.id)
      const updatedLabels = [...cardLabels, newLabel]
      setCardLabels(updatedLabels)
      setActiveDropdown(null)
      setLabelTitle('')
      setSelectedColor(null)
      
      if (onCardUpdate) {
        onCardUpdate(card.id, { labels: updatedLabels })
      }
    } catch (error) {
      console.error('Error adding label:', error)
    } finally {
      setIsCreatingLabel(false)
    }
  }

  const handleColorSelect = (colorOption) => {
    setSelectedColor(colorOption)
  }

  const handleCreateLabel = () => {
    if (selectedColor) {
      // Always create a label when Save is clicked, even if title is empty
      // If title is empty, use the color name
      const title = labelTitle.trim() || selectedColor.name
      console.log('Creating label with:', { title, colorName: selectedColor.name, colorValue: selectedColor.color })
      handleAddLabel(selectedColor.name, selectedColor.color, title)
    }
  }

  const handleRemoveLabel = async (labelId) => {
    try {
      await removeCardLabel(card.id, labelId)
      const updatedLabels = cardLabels.filter(label => label.id !== labelId)
      setCardLabels(updatedLabels)
      
      if (onCardUpdate) {
        onCardUpdate(card.id, { labels: updatedLabels })
      }
    } catch (error) {
      console.error('Error removing label:', error)
    }
  }

  const handleAddAssignee = async (userId) => {
    try {
      const newAssignee = await addCardAssignee(card.id, userId)
      const updatedAssignees = [...cardAssignees, newAssignee]
      setCardAssignees(updatedAssignees)
      setActiveDropdown(null)
      
      if (onCardUpdate) {
        onCardUpdate(card.id, { assignees: updatedAssignees })
      }
    } catch (error) {
      console.error('Error adding assignee:', error)
    }
  }

  const handleRemoveAssignee = async (userId) => {
    try {
      console.log('Removing assignee:', userId, 'from card:', card.id)
      const result = await removeCardAssignee(card.id, userId)
      console.log('Remove assignee result:', result)
      const updatedAssignees = cardAssignees.filter(assignee => assignee.id !== userId)
      setCardAssignees(updatedAssignees)
      
      if (onCardUpdate) {
        onCardUpdate(card.id, { assignees: updatedAssignees })
      }
    } catch (error) {
      console.error('Error removing assignee:', error)
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
    
    return date.toLocaleDateString()
  }

  return (
    <div 
      className="fixed inset-0 bg-opacity-10 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={() => setActiveDropdown(null)}
    >
      <div 
        ref={modalRef} 
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[70vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

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
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(70vh-80px)]">

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                      {title}
                    </h1>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown('labels')}
                    data-dropdown="labels"
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Labels</span>
                  </button>
                  {activeDropdown === 'labels' && (
                    <div 
                      ref={labelsDropdownRef}
                      className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 min-w-[280px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Enter label name..."
                          value={labelTitle}
                          onChange={(e) => setLabelTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (selectedColor && !isCreatingLabel) {
                                handleCreateLabel()
                              }
                            } else if (e.key === 'Escape') {
                              setSelectedColor(null)
                              setLabelTitle('')
                              setActiveDropdown(null)
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        
                        <div className="grid grid-cols-4 gap-1">
                          {predefinedColors.map(colorOption => {
                            const boardLabel = boardLabels.find(label => label.color_hex === colorOption.color)
                            const isApplied = cardLabels.some(cardLabel => cardLabel.color_hex === colorOption.color)
                            const isSelected = selectedColor?.color === colorOption.color
                            
                            return (
                              <div 
                                key={colorOption.color} 
                                className={`flex items-center justify-center p-2 rounded cursor-pointer transition-colors relative ${
                                  isApplied ? 'bg-blue-50 border border-blue-200' : 
                                  isSelected ? 'bg-gray-100 border-2 border-blue-400' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                  if (isApplied) {
                                    const labelToRemove = cardLabels.find(cardLabel => cardLabel.color_hex === colorOption.color)
                                    if (labelToRemove) {
                                      handleRemoveLabel(labelToRemove.id)
                                    }
                                  } else {
                                    setSelectedColor(colorOption)
                                  }
                                }}
                              >
                                <div className={`w-6 h-6 rounded`} style={{ backgroundColor: colorOption.color }}></div>
                              </div>
                            )
                          })}
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <button
                            onClick={handleCreateLabel}
                            disabled={!selectedColor || isCreatingLabel}
                            className={`px-3 py-1.5 text-sm rounded transition-colors cursor-pointer ${
                              selectedColor && !isCreatingLabel
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isCreatingLabel ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedColor(null)
                              setLabelTitle('')
                              setActiveDropdown(null)
                            }}
                            className="px-3 py-1.5 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => toggleDropdown('dates')}
                  data-dropdown="dates"
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors relative cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Dates</span>
                  {activeDropdown === 'dates' && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 min-w-[250px]">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Set due date:</label>
                        <input
                          id="due-date-input"
                          type="date"
                          value={dueDate ? dueDate.split('T')[0] : ''}
                          onChange={(e) => {
                            const selectedDate = e.target.value
                            if (selectedDate) {
                              handleSaveDueDate(selectedDate)
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  )}
                </button>
                <button 
                  onClick={() => toggleDropdown('members')}
                  data-dropdown="members"
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors relative cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Members</span>
                  {activeDropdown === 'members' && (
                    <div ref={membersDropdownRef} className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 min-w-[250px]">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Board members</h4>
                        <div className="space-y-1">
                          {boardMembers.length === 0 ? (
                            <p className="text-sm text-gray-500 py-2">No members found</p>
                          ) : (
                            boardMembers.map(member => {
                              const isAssigned = cardAssignees.some(assignee => assignee.id === member.id)
                              return (
                                <div 
                                  key={member.id} 
                                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                                    isAssigned 
                                      ? 'bg-blue-50 border border-blue-200' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => isAssigned ? handleRemoveAssignee(member.id) : handleAddAssignee(member.id)}
                                >
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-sm text-white font-medium">
                                      {member.display_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900">{member.display_name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {isAssigned && (
                                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {isAssigned ? 'Assigned' : 'Click to assign'}
                                    </span>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {cardLabels.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Labels</h4>
                    <div className="flex flex-wrap gap-1">
                      {cardLabels.map(label => (
                        <div 
                          key={label.id}
                          className="group relative flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: label.color_hex }}
                        >
                          <span>{label.name || label.color_hex}</span>
                          <button 
                            onClick={() => handleRemoveLabel(label.id)}
                            className="ml-2 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black hover:bg-opacity-20 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <span className="text-xs">×</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cardAssignees.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Members</h4>
                    <div className="flex flex-wrap gap-2">
                      {cardAssignees.map(assignee => (
                        <div 
                          key={assignee.id}
                          className="group relative flex items-center space-x-2 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {assignee.display_name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{assignee.display_name}</span>
                          <button 
                            onClick={() => handleRemoveAssignee(assignee.id)}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <span className="text-xs text-red-600">×</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dueDate && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Due date</h4>
                    <div className={`group relative inline-flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                      (() => {
                        const today = new Date()
                        const due = new Date(dueDate)
                        const diffTime = due.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        
                        if (diffDays < 0) {
                          return 'bg-red-50 hover:bg-red-100 border-red-200'
                        } else if (diffDays <= 1) {
                          return 'bg-orange-50 hover:bg-orange-100 border-orange-200'
                        } else if (diffDays <= 7) {
                          return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
                        } else {
                          return 'bg-green-50 hover:bg-green-100 border-green-200'
                        }
                      })()
                    }`}>
                      <svg className={`w-4 h-4 ${
                        (() => {
                          const today = new Date()
                          const due = new Date(dueDate)
                          const diffTime = due.getTime() - today.getTime()
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          
                          if (diffDays < 0) {
                            return 'text-red-600'
                          } else if (diffDays <= 1) {
                            return 'text-orange-600'
                          } else if (diffDays <= 7) {
                            return 'text-yellow-600'
                          } else {
                            return 'text-green-600'
                          }
                        })()
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`text-sm font-medium ${
                        (() => {
                          const today = new Date()
                          const due = new Date(dueDate)
                          const diffTime = due.getTime() - today.getTime()
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          
                          if (diffDays < 0) {
                            return 'text-red-800'
                          } else if (diffDays <= 1) {
                            return 'text-orange-800'
                          } else if (diffDays <= 7) {
                            return 'text-yellow-800'
                          } else {
                            return 'text-green-800'
                          }
                        })()
                      }`}>
                        {new Date(dueDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        (() => {
                          const today = new Date()
                          const due = new Date(dueDate)
                          const diffTime = due.getTime() - today.getTime()
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          
                          if (diffDays < 0) {
                            return 'bg-red-200 text-red-700'
                          } else if (diffDays <= 1) {
                            return 'bg-orange-200 text-orange-700'
                          } else if (diffDays <= 7) {
                            return 'bg-yellow-200 text-yellow-700'
                          } else {
                            return 'bg-green-200 text-green-700'
                          }
                        })()
                      }`}>
                        {(() => {
                          const today = new Date()
                          const due = new Date(dueDate)
                          const diffTime = due.getTime() - today.getTime()
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          
                          if (diffDays < 0) {
                            return 'Overdue'
                          } else if (diffDays === 0) {
                            return 'Due today'
                          } else if (diffDays === 1) {
                            return 'Due tomorrow'
                          } else if (diffDays <= 7) {
                            return 'Due soon'
                          } else {
                            return 'Upcoming'
                          }
                        })()}
                      </span>
                      <button 
                        onClick={handleRemoveDueDate}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <span className="text-xs text-red-600">×</span>
                      </button>
                    </div>
                  </div>
                )}
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
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingDescription(false)
                          setDescription(card?.description || '')
                        }}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
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
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Comments and activity</h3>
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
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Save
                </button>
              </div>

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-medium">
                          {comment.author?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{comment.author?.display_name || 'Unknown'}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{comment.body}</p>
                        <button className="text-xs text-gray-500 hover:text-gray-700 mt-1">
                          {formatTimeAgo(comment.created_at)}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
