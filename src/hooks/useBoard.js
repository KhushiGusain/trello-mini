import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useBoard(boardId) {
  const [board, setBoard] = useState(null)
  const [lists, setLists] = useState([])
  const [labels, setLabels] = useState([])
  const [activities, setActivities] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/boards/${boardId}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        if (response.status === 403) {
          setError('Access denied')
          return
        }
        if (response.status === 404) {
          setError('Board not found')
          return
        }
        throw new Error('Failed to fetch board')
      }
      
      const data = await response.json()
      
      setBoard(data.board)
      setLists(data.lists)
      setLabels(data.labels)
      setActivities(data.activities)
      setUserRole(data.userRole)
      
    } catch (err) {
      console.error('Error fetching board:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [boardId, router])

  const createList = useCallback(async (title) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error('Failed to create list')
      }

      const newList = await response.json()
      setLists(prev => [...prev, { ...newList, cards: [] }])
      
      return newList
    } catch (err) {
      console.error('Error creating list:', err)
      throw err
    }
  }, [boardId])

  const updateList = useCallback(async (listId, title) => {
    try {
      const updatedLists = lists.map(list => 
        list.id === listId ? { ...list, title } : list
      )
      
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lists: updatedLists }),
      })

      if (!response.ok) {
        throw new Error('Failed to update list')
      }

      setLists(updatedLists)
    } catch (err) {
      console.error('Error updating list:', err)
      throw err
    }
  }, [boardId, lists])

  const deleteList = useCallback(async (listId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete list')
      }

      setLists(prev => prev.filter(list => list.id !== listId))
    } catch (err) {
      console.error('Error deleting list:', err)
      throw err
    }
  }, [boardId])

  const createCard = useCallback(async (listId, title, description = '') => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ list_id: listId, title, description }),
      })

      if (!response.ok) {
        throw new Error('Failed to create card')
      }

      const newCard = await response.json()
      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, cards: [...list.cards, newCard] }
          : list
      ))
      
      return newCard
    } catch (err) {
      console.error('Error creating card:', err)
      throw err
    }
  }, [boardId])

  const updateCard = useCallback(async (cardId, updates) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update card')
      }

      const updatedCard = await response.json()
      setLists(prev => prev.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, ...updatedCard } : card
        )
      })))
      
      return updatedCard
    } catch (err) {
      console.error('Error updating card:', err)
      throw err
    }
  }, [boardId])

  const deleteCard = useCallback(async (listId, cardId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete card')
      }

      setLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, cards: list.cards.filter(card => card.id !== cardId) }
          : list
      ))
    } catch (err) {
      console.error('Error deleting card:', err)
      throw err
    }
  }, [boardId])

  const updateListsOrder = useCallback(async (newLists) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lists: newLists }),
      })

      if (!response.ok) {
        throw new Error('Failed to update lists order')
      }

      setLists(newLists)
    } catch (err) {
      console.error('Error updating lists order:', err)
      throw err
    }
  }, [boardId])

  const updateCardsOrder = useCallback(async (newLists) => {
    try {
      const cardsWithListId = newLists.flatMap(list => 
        list.cards.map(card => ({
          ...card,
          list_id: list.id
        }))
      )
      
      console.log('Sending cards update to API:', cardsWithListId)
      
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards: cardsWithListId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error response:', errorData)
        throw new Error('Failed to update cards order')
      }

      console.log('Cards order updated successfully')
      setLists(newLists)
    } catch (err) {
      console.error('Error updating cards order:', err)
      throw err
    }
  }, [boardId])

  const updateBoard = useCallback(async (updates) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update board')
      }

      const updatedBoard = await response.json()
      setBoard(prev => ({ ...prev, ...updatedBoard }))
      
      return updatedBoard
    } catch (err) {
      console.error('Error updating board:', err)
      throw err
    }
  }, [boardId])

  const getCardComments = useCallback(async (cardId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/comments`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      return await response.json()
    } catch (err) {
      console.error('Error fetching comments:', err)
      throw err
    }
  }, [boardId])

  const addCardComment = useCallback(async (cardId, content) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const newComment = await response.json()
      return newComment
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }, [boardId])

  const getCardLabels = useCallback(async (cardId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/labels`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch card labels')
      }

      return await response.json()
    } catch (err) {
      console.error('Error fetching card labels:', err)
      throw err
    }
  }, [boardId])

  const addCardLabel = useCallback(async (cardId, labelId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label_id: labelId }),
      })

      if (!response.ok) {
        throw new Error('Failed to add label to card')
      }

      const newLabel = await response.json()
      return newLabel
    } catch (err) {
      console.error('Error adding label to card:', err)
      throw err
    }
  }, [boardId])

  const removeCardLabel = useCallback(async (cardId, labelId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/labels?label_id=${labelId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove label from card')
      }

      return await response.json()
    } catch (err) {
      console.error('Error removing label from card:', err)
      throw err
    }
  }, [boardId])

  const getCardAssignees = useCallback(async (cardId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/assignees`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch card assignees')
      }

      return await response.json()
    } catch (err) {
      console.error('Error fetching card assignees:', err)
      throw err
    }
  }, [boardId])

  const addCardAssignee = useCallback(async (cardId, userId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/assignees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign user to card')
      }

      const newAssignee = await response.json()
      return newAssignee
    } catch (err) {
      console.error('Error assigning user to card:', err)
      throw err
    }
  }, [boardId])

  const removeCardAssignee = useCallback(async (cardId, userId) => {
    try {
      console.log('API call: removing assignee', userId, 'from card', cardId)
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/assignees?user_id=${userId}`, {
        method: 'DELETE',
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('API error response:', errorData)
        throw new Error(`Failed to remove assignee from card: ${response.status} ${errorData}`)
      }

      const result = await response.json()
      console.log('API success result:', result)
      return result
    } catch (err) {
      console.error('Error removing assignee from card:', err)
      throw err
    }
  }, [boardId])

  const getBoardMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/members`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch board members')
      }

      return await response.json()
    } catch (err) {
      console.error('Error fetching board members:', err)
      throw err
    }
  }, [boardId])

  const refreshBoardLabels = useCallback(async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch board data')
      }

      const data = await response.json()
      setLabels(data.labels)
      return data.labels
    } catch (err) {
      console.error('Error refreshing board labels:', err)
      throw err
    }
  }, [boardId])

  useEffect(() => {
    if (boardId) {
      fetchBoard()
    }
  }, [boardId, fetchBoard])

  return {
    board,
    lists,
    labels,
    activities,
    userRole,
    loading,
    error,
    refetch: fetchBoard,
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
  }
}
