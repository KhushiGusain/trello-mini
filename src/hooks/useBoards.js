'use client'

import { useState } from 'react'

export function useBoards() {
  const [boards, setBoards] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [boardToDelete, setBoardToDelete] = useState(null)
  const [newBoardData, setNewBoardData] = useState({
    title: '',
    visibility: 'workspace',
    backgroundColor: '#3a72ee'
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateBoard = async () => {
    if (!newBoardData.title.trim()) return

    setIsCreating(true)
    try {
      const newBoard = {
        id: Date.now().toString(),
        title: newBoardData.title,
        visibility: newBoardData.visibility,
        backgroundColor: newBoardData.backgroundColor,
        workspace: 'Personal',
        createdAt: new Date().toISOString()
      }

      setBoards(prev => [newBoard, ...prev])
      setNewBoardData({ title: '', visibility: 'workspace', backgroundColor: '#3a72ee' })
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating board:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteBoard = (board) => {
    setBoardToDelete(board)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return

    setIsDeleting(true)
    try {
      setBoards(prev => prev.filter(board => board.id !== boardToDelete.id))
      setBoardToDelete(null)
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error('Error deleting board:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const resetBoardData = () => {
    setNewBoardData({ title: '', visibility: 'workspace', backgroundColor: '#3a72ee' })
  }

  return {
    boards,
    setBoards,
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
    confirmDeleteBoard,
    resetBoardData
  }
}
