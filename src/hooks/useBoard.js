'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export default function useBoard(boardId) {
  const [board, setBoard] = useState(null)
  const [lists, setLists] = useState([])
  const [labels, setLabels] = useState([])
  const [activities, setActivities] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  const applyOptimisticUpdate = useCallback((updater) => {
    setLists(updater)
  }, [])

  const fetchBoard = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/boards/${boardId}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) throw new Error('Failed to fetch board')
      
      const data = await response.json()
      setBoard(data.board)
      setLists(data.lists)
      setLabels(data.labels)
      setActivities(data.activities)
      setUserRole(data.userRole)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      console.error('Error fetching board:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [boardId])

  const createList = useCallback(async (title) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })

      if (!response.ok) throw new Error('Failed to create list')

      const createdList = await response.json()
      
      applyOptimisticUpdate(prevLists => [...prevLists, createdList])
      
      return createdList
    } catch (err) {
      console.error('Error creating list:', err)
      throw err
    }
  }, [boardId, applyOptimisticUpdate])

  const updateList = useCallback(async (listId, updates) => {
    const originalLists = lists
    applyOptimisticUpdate(prevLists => 
      prevLists.map(list => 
        list.id === listId ? { ...list, ...updates, updated_at: new Date().toISOString() } : list
      )
    )

    try {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update list')

      const updatedList = await response.json()
      
      applyOptimisticUpdate(prevLists => 
        prevLists.map(list => list.id === listId ? { ...list, ...updatedList } : list)
      )
      
      return updatedList
    } catch (err) {
      setLists(originalLists)
      console.error('Error updating list:', err)
      throw err
    }
  }, [boardId, lists, applyOptimisticUpdate])

  const deleteList = useCallback(async (listId) => {
    const originalLists = lists
    applyOptimisticUpdate(prevLists => 
      prevLists.filter(list => list.id !== listId)
    )

    try {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete list')
    } catch (err) {
      setLists(originalLists)
      console.error('Error deleting list:', err)
      throw err
    }
  }, [boardId, lists, applyOptimisticUpdate])

  const createCard = useCallback(async (listId, title) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list_id: listId, title: title.trim() }),
      })

      if (!response.ok) throw new Error('Failed to create card')

      const createdCard = await response.json()
      
      applyOptimisticUpdate(prevLists => 
        prevLists.map(list => 
          list.id === listId 
            ? { ...list, cards: [...(list.cards || []), createdCard] }
            : list
        )
      )
      
      return createdCard
    } catch (err) {
      console.error('Error creating card:', err)
      throw err
    }
  }, [boardId, lists, applyOptimisticUpdate])

  const updateCard = useCallback(async (cardId, updates) => {
    const originalLists = lists
    applyOptimisticUpdate(prevLists => 
      prevLists.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, ...updates, updated_at: new Date().toISOString() } : card
        )
      }))
    )

    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update card')

      const updatedCard = await response.json()
      
      applyOptimisticUpdate(prevLists => 
        prevLists.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, ...updatedCard } : card
        )
        }))
      )
      
      return updatedCard
    } catch (err) {
      setLists(originalLists)
      console.error('Error updating card:', err)
      throw err
    }
  }, [boardId, lists, applyOptimisticUpdate])

  const deleteCard = useCallback(async (listId, cardId) => {
    const originalLists = lists
    applyOptimisticUpdate(prevLists => 
      prevLists.map(list => 
        list.id === listId 
          ? { ...list, cards: list.cards.filter(card => card.id !== cardId) }
          : list
      )
    )

    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${cardId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete card')
    } catch (err) {
      setLists(originalLists)
      console.error('Error deleting card:', err)
      throw err
    }
  }, [boardId, lists, applyOptimisticUpdate])

  const updateListsOrder = useCallback(async (newLists) => {
    const originalLists = lists
    setLists(newLists)

    try {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lists: newLists }),
      })

      if (!response.ok) throw new Error('Failed to update lists order')
    } catch (err) {
      setLists(originalLists)
      console.error('Error updating lists order:', err)
    }
  }, [boardId, lists])

  const updateCardsOrder = useCallback(async (newLists) => {
    const originalLists = lists
    setLists(newLists)

    try {
      const cardsToUpdate = newLists
        .filter(list => list && list.id && !list.id.startsWith('temp_'))
        .flatMap(list => 
          (list.cards || [])
            .filter(card => card && card.id && !card.id.startsWith('temp_') && !card.id.startsWith('real_'))
            .map(card => ({
              id: card.id,
              list_id: list.id,
              position: card.position,
              title: card.title,
              description: card.description || '',
              due_date: card.due_date
            }))
        )
      
      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: cardsToUpdate }),
      })

      if (!response.ok) throw new Error('Failed to update cards order')
    } catch (err) {
      setLists(originalLists)
      console.error('Error updating cards order:', err)
    }
  }, [boardId, lists])

  const moveCard = useCallback(async (fromListId, toListId, cardId, newPosition) => {
    const originalLists = lists
    
    const movedCard = originalLists
      .find(l => l.id === fromListId)
      ?.cards?.find(c => c.id === cardId)

    if (!movedCard) {
      console.error('Card not found for moving:', { fromListId, cardId })
      return
    }

    if (movedCard.id.startsWith('temp_') || movedCard.id.startsWith('real_')) {
      console.log('Skipping move for temporary card:', movedCard.id)
      return
    }

    const updatedLists = lists.map(list => {
      const cards = list.cards || []
      
      if (list.id === fromListId) {
        return { ...list, cards: cards.filter(card => card.id !== cardId) }
      }
      if (list.id === toListId) {
        const newCards = [...cards]
        newCards.splice(newPosition, 0, { ...movedCard, list_id: toListId })
        const updatedCards = newCards.map((c, index) => ({
          ...c,
          position: (index + 1) * 1000
        }))
        return { ...list, cards: updatedCards }
      }
      return list
    })

    setLists(updatedLists)

    try {
      const cardsToUpdate = updatedLists
        .filter(list => list && list.id && !list.id.startsWith('temp_'))
        .flatMap(list => 
          (list.cards || [])
            .filter(card => card && card.id && !card.id.startsWith('temp_') && !card.id.startsWith('real_'))
            .map(card => ({
              id: card.id,
              list_id: list.id,
              position: card.position,
              title: card.title,
              description: card.description || '',
              due_date: card.due_date,
              moved: card.id === cardId,
              previous_list_id: fromListId
            }))
        )

      console.log('Cards to update (filtered):', cardsToUpdate.map(c => ({ id: c.id, title: c.title })))

      console.log('Moving card:', { cardId, fromListId, toListId, newPosition })
      console.log('Cards to update:', cardsToUpdate.length)

      const response = await fetch(`/api/boards/${boardId}/cards`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: cardsToUpdate }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to move card: ${errorData.error || response.statusText}`)
      }
    } catch (err) {
      setLists(originalLists)
      console.error('Error moving card:', err)
      throw err
    }
  }, [boardId, lists])

  const updateBoard = useCallback(async (updates) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update board')

      const updatedBoard = await response.json()
      setBoard(prev => ({ ...prev, ...updatedBoard }))
      
      return updatedBoard
    } catch (err) {
      console.error('Error updating board:', err)
      throw err
    }
  }, [boardId])

  const refetch = useCallback(() => {
    fetchBoard()
  }, [fetchBoard])

  useEffect(() => {
      fetchBoard()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchBoard])

  return {
    board,
    lists,
    labels,
    activities,
    userRole,
    loading,
    error,
    refetch,
    createList,
    updateList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    updateListsOrder,
    updateCardsOrder,
    moveCard,
    updateBoard,
    addBoardLabel: (newLabel) => {
      setLabels(prev => [...prev, newLabel])
    },
    getCardComments: async (cardId) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/comments`)
        if (!response.ok) throw new Error('Failed to fetch comments')
        return await response.json()
      } catch (err) {
        console.error('Error fetching comments:', err)
        return []
      }
    },
    addCardComment: async (cardId, body) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: body }),
        })
        if (!response.ok) throw new Error('Failed to add comment')
        return await response.json()
      } catch (err) {
        console.error('Error adding comment:', err)
        throw err
      }
    },
    getCardLabels: async (cardId) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/labels`)
        if (!response.ok) throw new Error('Failed to fetch card labels')
        return await response.json()
      } catch (err) {
        console.error('Error fetching card labels:', err)
        return []
      }
    },
    addCardLabel: async (cardId, labelId) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/labels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label_id: labelId }),
        })
        if (!response.ok) throw new Error('Failed to add label')
        return await response.json()
      } catch (err) {
        console.error('Error adding label:', err)
        throw err
      }
    },
    removeCardLabel: async (cardId, labelId) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/labels?label_id=${labelId}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to remove label')
        return await response.json()
      } catch (err) {
        console.error('Error removing label:', err)
        throw err
      }
    },
    getCardAssignees: async (cardId) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/assignees`)
        if (!response.ok) throw new Error('Failed to fetch card assignees')
        return await response.json()
      } catch (err) {
        console.error('Error fetching card assignees:', err)
        return []
      }
    },
    addCardAssignee: async (cardId, userId) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/assignees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        })
        if (!response.ok) throw new Error('Failed to add assignee')
        return await response.json()
      } catch (err) {
        console.error('Error adding assignee:', err)
        throw err
      }
    },
    removeCardAssignee: async (cardId, userId) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/cards/${cardId}/assignees?user_id=${userId}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to remove assignee')
        return await response.json()
      } catch (err) {
        console.error('Error removing assignee:', err)
        throw err
      }
    },
    getBoardMembers: useCallback(async () => {
      try {
        const response = await fetch(`/api/boards/${boardId}/members`)
        if (!response.ok) throw new Error('Failed to fetch board members')
        return await response.json()
      } catch (err) {
        console.error('Error fetching board members:', err)
        return []
      }
    }, [boardId]),
    inviteBoardMember: async (email) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!response.ok) throw new Error('Failed to invite member')
        return await response.json()
      } catch (err) {
        console.error('Error inviting member:', err)
        throw err
      }
    },
    removeBoardMember: async (memberId) => {
      try {
        const response = await fetch(`/api/boards/${boardId}/members?member_id=${memberId}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to remove member')
        return await response.json()
      } catch (err) {
        console.error('Error removing member:', err)
        throw err
      }
    },

  }
}
