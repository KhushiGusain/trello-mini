'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, use, useState, useRef } from 'react'
import { Button } from '@/components/ui'
import KanbanBoard from '@/components/boards/KanbanBoard'
import ActivitySidebar from '@/components/boards/ActivitySidebar'
import { useBoard } from '@/hooks/useBoard'

export default function BoardPage({ params }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { id } = use(params)
  const [isActivitySidebarCollapsed, setIsActivitySidebarCollapsed] = useState(false)
  const [boardMembers, setBoardMembers] = useState([])
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedDueDate, setSelectedDueDate] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1)
  const searchRef = useRef(null)
  const [cardToOpen, setCardToOpen] = useState(null)
  
  const {
    board,
    lists,
    labels,
    activities,
    userRole,
    loading: boardLoading,
    error: boardError,
    refetch,
    createList,
    updateList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    updateListsOrder,
    updateCardsOrder,
    updateBoard,
    getCardComments,
    addCardComment,
    getCardLabels,
    addCardLabel,
    removeCardLabel,
    getCardAssignees,
    addCardAssignee,
    removeCardAssignee,
    getBoardMembers,
    refreshBoardLabels,
  } = useBoard(id)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (board && getBoardMembers) {
      const fetchMembers = async () => {
        try {
          const members = await getBoardMembers()
          setBoardMembers(members)
        } catch (error) {
          console.error('Error fetching board members:', error)
        }
      }
      fetchMembers()
    }
  }, [board, getBoardMembers])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (cardToOpen) {
      const timer = setTimeout(() => {
        setCardToOpen(null)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [cardToOpen])

  const toggleActivitySidebar = () => {
    setIsActivitySidebarCollapsed(!isActivitySidebarCollapsed)
  }

  const handleListsChange = (newLists) => {
    updateListsOrder(newLists)
  }

  const handleBoardUpdate = async (updates) => {
    try {
      await updateBoard(updates)
    } catch (error) {
      console.error('Error updating board:', error)
    }
  }

  const handleTitleEdit = () => {
    setTitleValue(board?.title || '')
    setIsEditingTitle(true)
  }

  const handleTitleSave = async () => {
    if (titleValue.trim() && titleValue !== board?.title) {
      try {
        await updateBoard({ title: titleValue.trim() })
      } catch (error) {
        console.error('Error updating board title:', error)
      }
    }
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setIsEditingTitle(false)
    setTitleValue('')
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      handleTitleCancel()
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setSelectedResultIndex(-1)
    if (query.trim()) {
      const results = []
      lists.forEach(list => {
        list.cards.forEach(card => {
          if (card.title.toLowerCase().includes(query.toLowerCase())) {
            results.push({ ...card, listTitle: list.title })
          }
        })
      })
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const handleSearchResultClick = (card) => {
    setShowSearchResults(false)
    setSearchQuery('')
    const list = lists.find(l => l.cards.some(c => c.id === card.id))
    if (list) {
      const cardWithListInfo = { ...card, list_id: list.id }
      setCardToOpen({ card: cardWithListInfo, listTitle: list.title })
    }
  }

  const handleFilterChange = (type, value) => {
    if (type === 'label') setSelectedLabel(value)
    if (type === 'member') setSelectedMember(value)
    if (type === 'dueDate') setSelectedDueDate(value)
  }

  const clearFilters = () => {
    setSelectedLabel('')
    setSelectedMember('')
    setSelectedDueDate('')
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  const getFilteredLists = () => {
    if (!selectedLabel && !selectedMember && !selectedDueDate) {
      return lists
    }

    return lists.map(list => ({
      ...list,
      cards: list.cards.filter(card => {
        const labelMatch = !selectedLabel || card.labels.some(label => label.id === selectedLabel)
        const memberMatch = !selectedMember || card.assignees.some(assignee => assignee.id === selectedMember)
        const dueDateMatch = !selectedDueDate || checkDueDateFilter(card.due_date, selectedDueDate)
        return labelMatch && memberMatch && dueDateMatch
      })
    }))
  }

  const checkDueDateFilter = (dueDate, filter) => {
    if (!dueDate) return filter === 'no-due'
    const today = new Date()
    const cardDate = new Date(dueDate)
    const diffTime = cardDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    switch (filter) {
      case 'overdue': return diffDays < 0
      case 'today': return diffDays === 0
      case 'week': return diffDays >= 0 && diffDays <= 7
      case 'month': return diffDays >= 0 && diffDays <= 30
      default: return true
    }
  }

  if (loading || boardLoading) {
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

  if (boardError) {    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eff1f1]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0c2144] mb-2">Error Loading Board</h2>
          <p className="text-[#6b7a90] mb-4">{boardError}</p>
          <Button onClick={() => router.push('/boards')} className="bg-[#3a72ee] text-white">
            Back to Boards
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen h-screen bg-[#eff1f1] flex flex-col">
      <div className="flex flex-col min-w-0 flex-1 min-h-0">
        <header className="bg-white border-b border-[#e5e7eb]">
          <div className="px-6 py-5 border-b border-[#f2f4f7]">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
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
                  {isEditingTitle ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onBlur={handleTitleSave}
                        className="text-2xl font-bold text-[#0c2144] bg-transparent border-b-2 border-[#3a72ee] focus:outline-none focus:border-[#3a72ee] px-1"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h1 
                      className="text-2xl font-bold text-[#0c2144] hover:underline cursor-pointer"
                      onClick={handleTitleEdit}
                    >
                    {board?.title || 'Loading Board...'}
                  </h1>
                  )}
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#e8f0ff] text-[#3a72ee]">
                    {board?.visibility === 'workspace' ? 'Workspace' : 'Private'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
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

        <div className="flex flex-1 min-h-0 h-full">
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="bg-white border-b border-[#e5e7eb] px-6 py-4">
              <div className="flex items-center space-x-6">
                 <div className="relative" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="Search cards..."
                     value={searchQuery}
                     onChange={(e) => handleSearch(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'ArrowDown') {
                         e.preventDefault()
                         setSelectedResultIndex(prev => 
                           prev < searchResults.length - 1 ? prev + 1 : 0
                         )
                       } else if (e.key === 'ArrowUp') {
                         e.preventDefault()
                         setSelectedResultIndex(prev => 
                           prev > 0 ? prev - 1 : searchResults.length - 1
                         )
                       } else if (e.key === 'Enter' && selectedResultIndex >= 0 && searchResults[selectedResultIndex]) {
                         e.preventDefault()
                         handleSearchResultClick(searchResults[selectedResultIndex])
                       } else if (e.key === 'Escape') {
                         setShowSearchResults(false)
                         setSearchQuery('')
                       }
                     }}
                    className="w-64 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                   
                   {showSearchResults && (
                     <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                       {searchResults.length > 0 ? (
                         searchResults.map((card, index) => (
                           <div
                             key={card.id}
                             onClick={() => handleSearchResultClick(card)}
                             className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                               index === selectedResultIndex 
                                 ? 'bg-[#e8f0ff] border-[#3a72ee]' 
                                 : 'hover:bg-gray-50'
                             }`}
                           >
                             <div className="font-medium text-[#0c2144] mb-1">{card.title}</div>
                             <div className="flex items-center justify-between">
                               <div className="text-sm text-[#6b7a90]">in {card.listTitle}</div>
                               <div className="flex items-center space-x-2">
                                 {card.labels && card.labels.length > 0 && (
                                   <div className="flex space-x-1">
                                     {card.labels.slice(0, 2).map((label) => (
                                       <div
                                         key={label.id}
                                         className="w-3 h-3 rounded-full"
                                         style={{ backgroundColor: label.color }}
                                         title={label.name}
                                       />
                                     ))}
                                     {card.labels.length > 2 && (
                                       <span className="text-xs text-[#6b7a90]">+{card.labels.length - 2}</span>
                                     )}
                                   </div>
                                 )}
                                 {card.assignees && card.assignees.length > 0 && (
                                   <div className="flex -space-x-1">
                                     {card.assignees.slice(0, 3).map((assignee) => (
                                       <div
                                         key={assignee.id}
                                         className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border border-white"
                                         title={assignee.display_name}
                                       >
                                         <span className="text-xs text-white font-medium">
                                           {assignee.display_name.charAt(0).toUpperCase()}
                                         </span>
                                       </div>
                                     ))}
                                     {card.assignees.length > 3 && (
                                       <span className="text-xs text-[#6b7a90] ml-1">+{card.assignees.length - 3}</span>
                                     )}
                                   </div>
                                 )}
                               </div>
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="px-4 py-6 text-center">
                           <div className="text-[#6b7a90] mb-2">
                             <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                             </svg>
                           </div>
                           <p className="text-sm text-[#6b7a90]">No cards found</p>
                           <p className="text-xs text-[#6b7a90] mt-1">Try a different search term</p>
                         </div>
                       )}
                     </div>
                   )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                     <select 
                       value={selectedLabel}
                       onChange={(e) => handleFilterChange('label', e.target.value)}
                       className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent cursor-pointer appearance-none pr-8"
                     >
                      <option value="">All Labels</option>
                       {labels?.map(label => (
                         <option key={label.id} value={label.id}>{label.name}</option>
                       ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <div className="relative">
                     <select 
                       value={selectedMember}
                       onChange={(e) => handleFilterChange('member', e.target.value)}
                       className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent cursor-pointer appearance-none pr-8"
                     >
                      <option value="">All Members</option>
                      <option value="me">Assigned to me</option>
                      <option value="unassigned">Unassigned</option>
                       {boardMembers?.map(member => (
                         <option key={member.id} value={member.id}>{member.display_name}</option>
                       ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <div className="relative">
                     <select 
                       value={selectedDueDate}
                       onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                       className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent cursor-pointer appearance-none pr-8"
                     >
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
                  
                   <button 
                     onClick={clearFilters}
                     className="px-2 py-1.5 text-xs text-[#6b7a90] hover:text-[#0c2144] hover:bg-gray-100 rounded transition-colors cursor-pointer"
                   >
                    Clear
                  </button>
                </div>
              </div>
            </div>
            
                         <KanbanBoard
               lists={getFilteredLists()}
               onListsChange={handleListsChange}
               onCreateList={createList}
               onUpdateList={updateList}
               onDeleteList={deleteList}
               onCreateCard={createCard}
               onUpdateCard={updateCard}
               onDeleteCard={deleteCard}
               onUpdateCardsOrder={updateCardsOrder}
               boardId={id}
               boardLabels={labels}
               boardMembers={boardMembers}
               onGetCardComments={getCardComments}
               onAddCardComment={addCardComment}
               onGetCardLabels={getCardLabels}
               onAddCardLabel={addCardLabel}
               onRemoveCardLabel={removeCardLabel}
               onGetCardAssignees={getCardAssignees}
               onAddCardAssignee={addCardAssignee}
               onRemoveCardAssignee={removeCardAssignee}
               onRefreshBoardLabels={refreshBoardLabels}
               cardToOpen={cardToOpen}
                        />
                      </div>
                      
          <ActivitySidebar 
            isCollapsed={isActivitySidebarCollapsed} 
            onToggleCollapse={toggleActivitySidebar}
            activities={activities}
          />
        </div>
      </div>
    </div>
  )
}
