'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, use, useState } from 'react'
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

  if (boardError) {
    return (
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
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0c2144] focus:outline-none focus:ring-2 focus:ring-[#3a72ee] focus:border-transparent cursor-pointer appearance-none pr-8">
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
                  
                  <button className="px-2 py-1.5 text-xs text-[#6b7a90] hover:text-[#0c2144] hover:bg-gray-100 rounded transition-colors cursor-pointer">
                    Clear
                  </button>
                </div>
              </div>
            </div>
            
            <KanbanBoard
              lists={lists}
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
