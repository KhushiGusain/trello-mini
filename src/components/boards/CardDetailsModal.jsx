'use client'

import { useState, useEffect, useRef } from 'react'
import ModalHeader from './modal/ModalHeader'
import CardTitle from './modal/CardTitle'
import ActionButtons from './modal/ActionButtons'
import DisplayPills from './modal/DisplayPills'
import DescriptionSection from './modal/DescriptionSection'
import CommentsSection from './modal/CommentsSection'

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
        <ModalHeader listTitle={listTitle} onClose={handleClose} />

        <div className="flex h-[calc(70vh-80px)]">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <CardTitle
                title={title}
                isEditingTitle={isEditingTitle}
                onTitleChange={setTitle}
                onSaveTitle={handleSaveTitle}
                onStartEditTitle={setIsEditingTitle}
              />

              <ActionButtons
                activeDropdown={activeDropdown}
                onToggleDropdown={toggleDropdown}
                labelTitle={labelTitle}
                onLabelTitleChange={setLabelTitle}
                selectedColor={selectedColor}
                onColorSelect={handleColorSelect}
                predefinedColors={predefinedColors}
                boardLabels={boardLabels}
                cardLabels={cardLabels}
                onRemoveLabel={handleRemoveLabel}
                onCreateLabel={handleCreateLabel}
                isCreatingLabel={isCreatingLabel}
                onCancelLabels={() => {
                  setSelectedColor(null)
                  setLabelTitle('')
                  setActiveDropdown(null)
                }}
                boardMembers={boardMembers}
                cardAssignees={cardAssignees}
                onAddAssignee={handleAddAssignee}
                onRemoveAssignee={handleRemoveAssignee}
                dueDate={dueDate}
                onSaveDueDate={handleSaveDueDate}
                labelsDropdownRef={labelsDropdownRef}
                membersDropdownRef={membersDropdownRef}
              />

              <DisplayPills
                cardLabels={cardLabels}
                onRemoveLabel={handleRemoveLabel}
                cardAssignees={cardAssignees}
                onRemoveAssignee={handleRemoveAssignee}
                dueDate={dueDate}
                onRemoveDueDate={handleRemoveDueDate}
              />

              <DescriptionSection
                description={description}
                isEditingDescription={isEditingDescription}
                onDescriptionChange={setDescription}
                onSaveDescription={handleSaveDescription}
                onStartEditDescription={setIsEditingDescription}
                onCancelEditDescription={() => setIsEditingDescription(false)}
                originalDescription={card?.description || ''}
              />
            </div>
          </div>

          <CommentsSection
            commentText={commentText}
            onCommentTextChange={setCommentText}
            onAddComment={handleAddComment}
            comments={comments}
            formatTimeAgo={formatTimeAgo}
          />
        </div>
      </div>
    </div>
  )
}
