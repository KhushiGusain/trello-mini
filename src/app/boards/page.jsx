'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import {
  BoardSearch,
  BoardsHeader,
  BoardsGrid,
  EmptyState,
  CreateBoardModal,
  DeleteBoardModal,
  NoResultsMessage
} from '@/components/boards'
import { useBoards } from '@/hooks/useBoards'

export default function BoardsPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const {
    boards,
    isLoading: boardsLoading,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    boardToDelete,
    setBoardToDelete,
    newBoardData,
    setNewBoardData,
    isCreating,
    isDeleting,
    handleCreateBoard,
    handleDeleteBoard,
    confirmDeleteBoard
  } = useBoards()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBoardClick = (boardId) => {
    router.push(`/boards/${boardId}`)
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
  }

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false)
  }

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
    setBoardToDelete(null)
  }

  if (loading || boardsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p style={{ color: 'var(--color-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p style={{ color: 'var(--color-muted)' }}>Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">

      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Mini Trello
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative user-menu">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-900 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <span className="text-white font-bold text-xl">
                    {(user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                  </span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>


              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">

                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.user_metadata?.name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>


                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        signOut()
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2 cursor-pointer rounded-lg mx-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <BoardsHeader />
        <BoardSearch searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        

        <div className="relative">
          {filteredBoards.length === 0 && searchQuery && (
            <NoResultsMessage searchQuery={searchQuery} />
          )}
          
          {filteredBoards.length === 0 && !searchQuery && !boardsLoading && (
            <EmptyState onCreateBoard={() => setIsCreateModalOpen(true)} />
          )}
          
          {filteredBoards.length > 0 && (
            <BoardsGrid
              boards={filteredBoards}
              onBoardClick={handleBoardClick}
              onDeleteBoard={handleDeleteBoard}
              onCreateBoard={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>
      </main>


      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        boardData={newBoardData}
        onBoardDataChange={setNewBoardData}
        onCreateBoard={handleCreateBoard}
        isCreating={isCreating}
      />

      <DeleteBoardModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        boardToDelete={boardToDelete}
        onConfirmDelete={confirmDeleteBoard}
        isDeleting={isDeleting}
      />
    </div>
  )
}
