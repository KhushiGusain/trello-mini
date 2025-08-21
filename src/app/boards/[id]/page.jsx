'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, use, useState } from 'react'
import { Button } from '@/components/ui'

export default function BoardPage({ params }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { id } = use(params)
  const [board, setBoard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActivitySidebarCollapsed, setIsActivitySidebarCollapsed] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  
  // Lists and Cards state
  const [lists, setLists] = useState([
    {
      id: '1',
      title: 'Backlog',
      position: 1,
      cards: [
        { id: '1', title: 'Design System Components', position: 1 },
        { id: '2', title: 'User Research Plan', position: 2 },
        { id: '3', title: 'API Documentation', position: 3 }
      ]
    },
    {
      id: '2',
      title: 'In Progress',
      position: 2,
      cards: [
        { id: '4', title: 'Prototype Design', position: 1 },
        { id: '5', title: 'Database Schema', position: 2 }
      ]
    },
    {
      id: '3',
      title: 'Done',
      position: 3,
      cards: [
        { id: '6', title: 'User Research', position: 1 }
      ]
    }
  ])
  
  // UI state
  const [editingListId, setEditingListId] = useState(null)
  const [editingCardId, setEditingCardId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [showAddList, setShowAddList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [draggedCard, setDraggedCard] = useState(null)
  const [draggedList, setDraggedList] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchBoard()
    }
  }, [user, id])

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${id}`)
      if (response.ok) {
        const data = await response.json()
        setBoard(data)
      }
    } catch (error) {
      console.error('Error fetching board:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActivitySidebar = () => {
    setIsActivitySidebarCollapsed(!isActivitySidebarCollapsed)
  }

  const toggleShowAllActivities = () => {
    setShowAllActivities(!showAllActivities);
  };

  // List operations
  const startEditList = (listId, currentTitle) => {
    setEditingListId(listId)
    setEditingText(currentTitle)
  }

  const saveListTitle = (listId) => {
    if (editingText.trim()) {
      setLists(prev => prev.map(list => 
        list.id === listId ? { ...list, title: editingText.trim() } : list
      ))
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
      setLists(prev => [...prev, newList])
      setNewListTitle('')
      setShowAddList(false)
    }
  }

  const deleteList = (listId) => {
    setLists(prev => prev.filter(list => list.id !== listId))
  }

  const reorderList = (fromIndex, toIndex) => {
    const newLists = [...lists]
    const [movedList] = newLists.splice(fromIndex, 1)
    newLists.splice(toIndex, 0, movedList)
    
    const updatedLists = newLists.map((list, index) => ({
      ...list,
      position: index + 1
    }))
    
    setLists(updatedLists)
  }

  // Card operations
  const startEditCard = (cardId, currentTitle) => {
    setEditingCardId(cardId)
    setEditingText(currentTitle)
  }

  const saveCardTitle = (cardId) => {
    if (editingText.trim()) {
      setLists(prev => prev.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, title: editingText.trim() } : card
        )
      })))
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
      
      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      ))
    }
  }

  const deleteCard = (listId, cardId) => {
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, cards: list.cards.filter(card => card.id !== cardId) }
        : list
    ))
  }

  const moveCard = (fromListId, toListId, cardId, newPosition) => {
    setLists(prev => {
      const newLists = [...prev]
      
      const fromList = newLists.find(l => l.id === fromListId)
      const toList = newLists.find(l => l.id === toListId)
      
      if (!fromList || !toList) return prev
      
      const card = fromList.cards.find(c => c.id === cardId)
      if (!card) return prev
      
      // Remove card from source list
      const updatedFromList = {
        ...fromList,
        cards: fromList.cards.filter(c => c.id !== cardId)
      }
      
      // Add card to target list at specified position
      const targetCards = [...toList.cards]
      if (newPosition === 0) {
        targetCards.unshift(card)
      } else if (newPosition >= targetCards.length) {
        targetCards.push(card)
      } else {
        targetCards.splice(newPosition, 0, card)
      }
      
      // Update positions for all cards in target list
      const updatedTargetCards = targetCards.map((c, index) => ({
        ...c,
        position: index + 1
      }))
      
      const updatedToList = {
        ...toList,
        cards: updatedTargetCards
      }
      
      // Update positions for remaining cards in source list
      const updatedSourceCards = updatedFromList.cards.map((c, index) => ({
        ...c,
        position: index + 1
      }))
      
      const finalFromList = {
        ...updatedFromList,
        cards: updatedSourceCards
      }
      
      return newLists.map(list => {
        if (list.id === fromListId) return finalFromList
        if (list.id === toListId) return updatedToList
        return list
      })
    })
  }

  const reorderCard = (listId, fromIndex, toIndex) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list
      
      const newCards = [...list.cards]
      const [movedCard] = newCards.splice(fromIndex, 1)
      newCards.splice(toIndex, 0, movedCard)
      
      const updatedCards = newCards.map((card, index) => ({
        ...card,
        position: index + 1
      }))
      
      return { ...list, cards: updatedCards }
    }))
  }

  // Drag and drop handlers
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
    
    // Add visual feedback for drop zones
    if (e.target.classList.contains('drop-zone')) {
      e.target.style.backgroundColor = '#e8f0ff'
      e.target.style.borderColor = '#3a72ee'
    }
  }

  const handleDragLeave = (e) => {
    // Remove visual feedback when leaving drop zones
    if (e.target.classList.contains('drop-zone')) {
      e.target.style.backgroundColor = 'transparent'
      e.target.style.borderColor = 'transparent'
    }
  }

  const handleDrop = (e, type, targetId, targetListId = null, position = null) => {
    e.preventDefault()
    
    // Remove visual feedback
    if (e.target.classList.contains('drop-zone')) {
      e.target.style.backgroundColor = 'transparent'
      e.target.style.borderColor = 'transparent'
    }
    
    try {
      if (type === 'card' && draggedCard) {
        if (draggedCard.listId === targetListId) {
          // Reordering within same list
          const fromIndex = lists.find(l => l.id === draggedCard.listId).cards.findIndex(c => c.id === draggedCard.id)
          const toIndex = position || 0
          if (fromIndex !== toIndex) {
            reorderCard(draggedCard.listId, fromIndex, toIndex)
          }
        } else {
          // Moving between lists
          moveCard(draggedCard.listId, targetListId, draggedCard.id, position || 0)
        }
      } else if (type === 'list' && draggedList) {
        // Reordering lists
        const fromIndex = lists.findIndex(l => l.id === draggedList.id)
        const toIndex = lists.findIndex(l => l.id === targetId)
        if (fromIndex !== toIndex) {
          reorderList(fromIndex, toIndex)
        }
      }
    } catch (error) {
      console.error('Error in drag and drop:', error)
    }
    
    // Reset dragged items
    setDraggedCard(null)
    setDraggedList(null)
    
    // Reset opacity
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eff1f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a72ee] mx-auto mb-4"></div>
          <p className="text-[#6b7a90]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eff1f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3a72ee] mx-auto mb-4"></div>
          <p className="text-[#6b7a90]">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen h-screen bg-[#eff1f1] flex flex-col">
      {/* Custom Scrollbar Styles */}
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
      
      {/* Main Content */}
      <div className="flex flex-col min-w-0 flex-1 min-h-0">
        {/* 1) Header (top bar) */}
        <header className="bg-white border-b border-[#e5e7eb]">
          {/* Top Section: Board Title, Visibility, Members, Invite */}
          <div className="px-6 py-5 border-b border-[#f2f4f7]">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                {/* Left: Back Button, Board Title and Visibility */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/boards')}
                    className="p-2 text-[#6b7a90] hover:text-[#0c2144] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Back to Boards"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h1 className="text-2xl font-bold text-[#0c2144] hover:underline cursor-pointer group">
                    {board?.title || 'Loading Board...'}
                    <svg className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </h1>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#e8f0ff] text-[#3a72ee]">
                    {board?.visibility === 'workspace' ? 'Workspace' : 'Private'}
                  </span>
                </div>
                
                {/* Right: Member Avatars and Invite Button */}
                <div className="flex items-center space-x-4">
                  {/* Member Avatars */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-[#6b7a90] font-medium">Team</span>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <span className="text-white text-sm font-semibold">K</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <span className="text-white text-sm font-semibold">A</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <span className="text-white text-sm font-semibold">M</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <span className="text-white text-sm font-semibold">S</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        <span className="text-white text-sm font-semibold">J</span>
                      </div>
                    </div>
                    <span className="text-sm text-[#6b7a90] ml-2 cursor-pointer hover:text-[#0c2144] transition-colors">+3 more</span>
                  </div>
                  
                  {/* Invite Button */}
                  <button className="px-4 py-2 border border-[#3a72ee] text-[#3a72ee] rounded-lg hover:bg-[#e8f0ff] transition-colors font-medium flex items-center space-x-2 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          

        </header>

        {/* 2) Toolbar and Main Content Area */}
        <div className="flex flex-1 min-h-0 h-full">
          {/* Left: Toolbar and Kanban Board */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Toolbar */}
            <div className="bg-white border-b border-[#e5e7eb] px-6 py-4">
              <div className="flex items-center space-x-6">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cards..."
                    className="w-64 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Filter Dropdowns */}
                <div className="flex items-center space-x-4">
                  {/* Labels Filter */}
                  <div className="relative">
                    <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent cursor-pointer appearance-none pr-8">
                      <option value="">All Labels</option>
                      <option value="design">Design</option>
                      <option value="bug">Bug</option>
                      <option value="feature">Feature</option>
                      <option value="research">Research</option>
                      <option value="backend">Backend</option>
                      <option value="frontend">Frontend</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {/* Assignee Filter */}
                  <div className="relative">
                    <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent cursor-pointer appearance-none pr-8">
                      <option value="">All Members</option>
                      <option value="me">Assigned to me</option>
                      <option value="unassigned">Unassigned</option>
                      <option value="khushi">Khushi</option>
                      <option value="alex">Alex</option>
                      <option value="maria">Maria</option>
                      <option value="sam">Sam</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {/* Due Date Filter */}
                  <div className="relative">
                    <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent cursor-pointer appearance-none pr-8">
                      <option value="">Due Date</option>
                      <option value="overdue">Overdue</option>
                      <option value="today">Due today</option>
                      <option value="week">Due this week</option>
                      <option value="month">Due this month</option>
                      <option value="no-due">No due date</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {/* Clear Filters Button */}
                  <button className="px-2 py-1.5 text-xs text-[#6b7a90] hover:text-[#0c2144] hover:bg-gray-100 rounded transition-colors cursor-pointer">
                    Clear
                  </button>
                </div>
              </div>
            </div>
            
            {/* Kanban Board - Only this area scrolls horizontally */}
            <div className="flex-1 p-6 bg-[#eff1f1] overflow-x-auto custom-scrollbar">
              <div className="flex space-x-4 min-w-max pb-2">
                {/* Dynamic Lists */}
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
                      {/* List Header */}
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
                      
                      {/* Cards */}
                      <div className="p-1 space-y-0.5">
                        {/* Drop zone at top of list */}
                        <div 
                          className={`${list.cards.length === 0 ? 'h-2' : 'h-1'} bg-transparent transition-all duration-200 drop-zone`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'card', null, list.id, 0)}
                        />
                        
                        {list.cards.map((card, cardIndex) => (
                          <div key={card.id}>
                            {/* Drop zone above card */}
                            <div 
                              className="h-0.5 bg-transparent transition-all duration-200 drop-zone"
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, 'card', null, list.id, cardIndex)}
                            />
                            
                            {/* Card */}
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
                                  <h4 
                                    className="text-[#0c2144] font-medium text-sm leading-tight flex-1 cursor-pointer hover:bg-gray-100 px-1 py-1 rounded transition-colors"
                                    onClick={() => startEditCard(card.id, card.title)}
                                  >
                                    {card.title}
                                  </h4>
                                  <button 
                                    className="opacity-0 group-hover:opacity-100 text-[#6b7a90] hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                                    onClick={() => deleteCard(list.id, card.id)}
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Drop zone for cards - improved visibility */}
                        <div 
                          className={`${list.cards.length === 0 ? 'h-2' : 'h-1'} bg-transparent transition-all duration-200 drop-zone`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'card', null, list.id, list.cards.length)}
                        />
                      </div>
                      
                      {/* Add Card Button */}
                      <div className="px-1 pb-1">
                        <AddCardButton listId={list.id} onCreateCard={createCard} />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add List Button */}
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
            </div>
          </div>
          
          {/* Right: Activity Sidebar - Fixed, doesn't scroll */}
          <div className={`bg-white border-l border-[#e5e7eb] transition-all duration-300 ease-in-out ${isActivitySidebarCollapsed ? 'w-16' : 'w-80'}`}>
            {isActivitySidebarCollapsed ? (
              <div className="p-4">
                <button
                  onClick={toggleActivitySidebar}
                  className="w-8 h-8 bg-[#3a72ee] text-white rounded-lg flex items-center justify-center hover:bg-[#2456f1] transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between">
                  <h3 className="text-[#0c2144] font-semibold text-sm">Activity</h3>
                  <button
                    onClick={toggleActivitySidebar}
                    className="w-6 h-6 text-[#6b7a90] hover:text-[#0c2144] hover:bg-gray-100 rounded flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Activity Events */}
                  <div className="space-y-4">
                    {/* Card Added */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">KG</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0c2144]">
                          <span className="font-medium">khushi gusain</span> added <span className="text-[#3a72ee] font-medium">"Design new landing page"</span> to <span className="text-[#3a72ee] font-medium">"In Progress"</span>
                        </p>
                        <p className="text-xs text-[#6b7a90] mt-1">2 minutes ago</p>
                      </div>
                    </div>

                    {/* Card Added */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">KG</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0c2144]">
                          <span className="font-medium">khushi gusain</span> added <span className="text-[#3a72ee] font-medium">"Fix login bug"</span> to <span className="text-[#3a72ee] font-medium">"To Do"</span>
                        </p>
                        <p className="text-xs text-[#6b7a90] mt-1">5 minutes ago</p>
                      </div>
                    </div>

                    {/* Card Added */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">KG</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0c2144]">
                          <span className="font-medium">khushi gusain</span> added <span className="text-[#3a72ee] font-medium">"Update user dashboard"</span> to <span className="text-[#3a72ee] font-medium">"Testing"</span>
                        </p>
                        <p className="text-xs text-[#6b7a90] mt-1">12 minutes ago</p>
                      </div>
                    </div>

                    {/* List Created */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">KG</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0c2144]">
                          <span className="font-medium">khushi gusain</span> created <span className="text-[#3a72ee] font-medium">"Testing"</span> list
                        </p>
                        <p className="text-xs text-[#6b7a90] mt-1">25 minutes ago</p>
                      </div>
                    </div>

                    {/* Board Added to Workspace */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">KG</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0c2144]">
                          <span className="font-medium">khushi gusain</span> added this board to <span className="text-[#3a72ee] font-medium">"Trello Workspace"</span>
                        </p>
                        <p className="text-xs text-[#6b7a90] mt-1">1 hour ago</p>
                      </div>
                    </div>

                    {/* Card Moved */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">KG</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0c2144]">
                          <span className="font-medium">khushi gusain</span> moved <span className="text-[#3a72ee] font-medium">"API documentation"</span> to <span className="text-[#3a72ee] font-medium">"Done"</span>
                        </p>
                        <p className="text-xs text-[#6b7a90] mt-1">1.5 hours ago</p>
                      </div>
                    </div>

                    {/* Card Updated */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">KG</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0c2144]">
                          <span className="font-medium">khushi gusain</span> updated <span className="text-[#3a72ee] font-medium">"Database optimization"</span>
                        </p>
                        <p className="text-xs text-[#6b7a90] mt-1">2 hours ago</p>
                      </div>
                    </div>

                    {/* Show More Button */}
                    {!showAllActivities && (
                      <button
                        onClick={toggleShowAllActivities}
                        className="w-full text-xs text-[#3a72ee] hover:text-[#2456f1] font-medium transition-colors cursor-pointer py-2 hover:bg-gray-50 rounded"
                      >
                        Show more activities
                      </button>
                    )}

                    {/* Additional Activities (Hidden by default) */}
                    {showAllActivities && (
                      <>
                        {/* List Renamed */}
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">KG</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0c2144]">
                              <span className="font-medium">khushi gusain</span> renamed <span className="text-[#3a72ee] font-medium">"Backlog"</span> to <span className="text-[#3a72ee] font-medium">"To Do"</span>
                            </p>
                            <p className="text-xs text-[#6b7a90] mt-1">2.5 hours ago</p>
                          </div>
                        </div>

                        {/* Card Archived */}
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">KG</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0c2144]">
                              <span className="font-medium">khushi gusain</span> archived <span className="text-[#3a72ee] font-medium">"Old feature request"</span>
                            </p>
                            <p className="text-xs text-[#6b7a90] mt-1">3 hours ago</p>
                          </div>
                        </div>

                        {/* Due Date Set */}
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">KG</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0c2144]">
                              <span className="font-medium">khushi gusain</span> set due date for <span className="text-[#3a72ee] font-medium">"User testing"</span> to <span className="text-[#3a72ee] font-medium">Dec 15</span>
                            </p>
                            <p className="text-xs text-[#6b7a90] mt-1">4 hours ago</p>
                          </div>
                        </div>

                        {/* Label Added */}
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">KG</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0c2144]">
                              <span className="font-medium">khushi gusain</span> added label <span className="text-[#3a72ee] font-medium">"Bug"</span> to <span className="text-[#3a72ee] font-medium">"Fix navigation"</span>
                            </p>
                            <p className="text-xs text-[#6b7a90] mt-1">5 hours ago</p>
                          </div>
                        </div>

                        {/* Comment Added */}
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-[#3a72ee] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">KG</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0c2144]">
                              <span className="font-medium">khushi gusain</span> commented on <span className="text-[#3a72ee] font-medium">"API Integration"</span>
                            </p>
                            <p className="text-xs text-[#6b7a90] mt-1">6 hours ago</p>
                          </div>
                        </div>

                        {/* Show Less Button */}
                        <button
                          onClick={toggleShowAllActivities}
                          className="w-full text-xs text-[#6b7a90] hover:text-[#0c2144] font-medium transition-colors cursor-pointer py-2 hover:bg-gray-50 rounded"
                        >
                          Show less
                        </button>
                      </>
                    )}

                    {/* Footer */}
                    <div className="text-center">
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// AddCardButton Component
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

