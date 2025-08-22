import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

async function getCurrentUser() {
  const cookieStore = await cookies()
  const customToken = cookieStore.get('sb-auth-token')?.value
  
  if (!customToken) {
    throw new Error('Unauthorized')
  }
  
  try {
    const tokenParts = customToken.split('.')
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format')
    }
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
    
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired')
    }
    
    return payload.sub
  } catch (error) {
    throw new Error('Invalid token')
  }
}

async function checkBoardAccess(boardId, userId) {
  const supabase = await getSupabaseClient()
  
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('created_by, visibility')
    .eq('id', boardId)
    .single()

  if (boardError) {
    throw new Error('Board not found')
  }

  const { data: boardMember } = await supabase
    .from('board_members')
    .select('role')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .single()

  if (board.visibility === 'private' && !boardMember && board.created_by !== userId) {
    throw new Error('Access denied')
  }

  return { board, boardMember }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getCurrentUser()
    const { id: boardId, cardId } = await params
    const body = await request.json()
    
    const supabase = await getSupabaseClient()
    
    const { board, boardMember } = await checkBoardAccess(boardId, userId)
    
    const canEdit = board.created_by === userId || 
                   boardMember?.role === 'owner' || 
                   boardMember?.role === 'editor'

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
    }

    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .eq('board_id', boardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const updateData = {
      updated_at: new Date().toISOString()
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.due_date !== undefined) updateData.due_date = body.due_date
    if (body.list_id !== undefined) updateData.list_id = body.list_id

    console.log('Updating card with data:', updateData)

    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', cardId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating card:', updateError)
      console.error('Update data that failed:', updateData)
      console.error('Card ID:', cardId)
      console.error('Board ID:', boardId)
      console.error('User ID:', userId)
      return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
    }

    console.log('Card updated successfully:', updatedCard)

    await supabase
      .from('activities')
      .insert({
        board_id: boardId,
        actor_id: userId,
        type: 'card.updated',
        data: {
          card_id: cardId,
          card_title: updatedCard.title,
          changes: body
        }
      })

    return NextResponse.json(updatedCard)
    
  } catch (error) {
    console.error('Error in PUT /api/boards/[id]/cards/[cardId]:', error)
    if (error.message === 'Unauthorized' || error.message === 'Invalid token' || error.message === 'Token expired') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error.message === 'Board not found' || error.message === 'Access denied') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getCurrentUser()
    const { id: boardId, cardId } = await params
    
    const supabase = await getSupabaseClient()
    
    const { board, boardMember } = await checkBoardAccess(boardId, userId)
    
    const canEdit = board.created_by === userId || 
                   boardMember?.role === 'owner' || 
                   boardMember?.role === 'editor'

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
    }

    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .eq('board_id', boardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const { error: labelsDeleteError } = await supabase
      .from('card_labels')
      .delete()
      .eq('card_id', cardId)

    if (labelsDeleteError) {
      console.error('Error deleting card labels:', labelsDeleteError)
      return NextResponse.json({ error: 'Failed to delete card labels' }, { status: 500 })
    }

    const { error: assigneesDeleteError } = await supabase
      .from('card_assignees')
      .delete()
      .eq('card_id', cardId)

    if (assigneesDeleteError) {
      console.error('Error deleting card assignees:', assigneesDeleteError)
      return NextResponse.json({ error: 'Failed to delete card assignees' }, { status: 500 })
    }

    const { error: commentsDeleteError } = await supabase
      .from('comments')
      .delete()
      .eq('card_id', cardId)

    if (commentsDeleteError) {
      console.error('Error deleting card comments:', commentsDeleteError)
      return NextResponse.json({ error: 'Failed to delete card comments' }, { status: 500 })
    }

    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (deleteError) {
      console.error('Error deleting card:', deleteError)
      return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
    }

    await supabase
      .from('activities')
      .insert({
        board_id: boardId,
        actor_id: userId,
        type: 'card.deleted',
        data: {
          card_id: cardId,
          card_title: card.title,
          list_id: card.list_id
        }
      })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in DELETE /api/boards/[id]/cards/[cardId]:', error)
    if (error.message === 'Unauthorized' || error.message === 'Invalid token' || error.message === 'Token expired') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error.message === 'Board not found' || error.message === 'Access denied') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
