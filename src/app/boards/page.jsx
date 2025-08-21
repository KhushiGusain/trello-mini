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
  
  const {
    boards,
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

  if (loading) {
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <header className="bg-white border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-navy)' }}>
            Mini Trello
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {user?.user_metadata?.name || user?.email}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <BoardsHeader />
        
        <BoardSearch 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange} 
        />

        {boards.length === 0 && !searchQuery ? (
          <EmptyState onCreateBoard={() => setIsCreateModalOpen(true)} />
        ) : (
          <>
            <BoardsGrid
              boards={filteredBoards}
              onBoardClick={handleBoardClick}
              onDeleteBoard={handleDeleteBoard}
              onCreateBoard={() => setIsCreateModalOpen(true)}
            />
            
            {searchQuery && filteredBoards.length === 0 && (
              <NoResultsMessage searchQuery={searchQuery} />
            )}
          </>
        )}
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
