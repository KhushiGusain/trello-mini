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

export async function GET(request, { params }) {
  try {
    const userId = await getCurrentUser()
    const { id } = await params
    
    const supabase = await getSupabaseClient()
    
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select(`
        *,
        workspace:workspaces(name),
        created_by_profile:profiles!boards_created_by_fkey(display_name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (boardError) {
      console.error('Error fetching board:', boardError)
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    const { data: boardMember, error: memberError } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', id)
      .eq('user_id', userId)
      .single()

    if (board.visibility === 'private' && !boardMember && board.created_by !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select(`
        *,
        cards(*)
      `)
      .eq('board_id', id)
      .order('position')

    if (listsError) {
      console.error('Error fetching lists:', listsError)
      return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 })
    }

    const { data: labels, error: labelsError } = await supabase
      .from('labels')
      .select('*')
      .eq('board_id', id)

    if (labelsError) {
      console.error('Error fetching labels:', labelsError)
      return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 })
    }

    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        *,
        actor:profiles(display_name, avatar_url)
      `)
      .eq('board_id', id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError)
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    const cardIds = lists.flatMap(list => 
      list.cards.filter(card => !card.archived).map(card => card.id)
    )

    let cardLabels = []
    let cardAssignees = []
    let cardComments = []

    if (cardIds.length > 0) {
      const { data: labelsData, error: labelsError } = await supabase
        .from('card_labels')
        .select(`
          card_id,
          label:labels(id, name, color_hex)
        `)
        .in('card_id', cardIds)

      if (labelsError) {
        console.error('Error fetching card labels:', labelsError)
      } else {
        cardLabels = labelsData
      }

      const { data: assigneesData, error: assigneesError } = await supabase
        .from('card_assignees')
        .select(`
          card_id,
          user:profiles(id, display_name, avatar_url)
        `)
        .in('card_id', cardIds)

      if (assigneesError) {
        console.error('Error fetching card assignees:', assigneesError)
      } else {
        cardAssignees = assigneesData
      }

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          card_id,
          body,
          created_at,
          author:profiles(display_name, avatar_url)
        `)
        .in('card_id', cardIds)
        .order('created_at', { ascending: true })

      if (commentsError) {
        console.error('Error fetching card comments:', commentsError)
      } else {
        cardComments = commentsData
      }
    }

    const processedLists = lists.map(list => ({
      id: list.id,
      title: list.title,
      position: list.position,
      cards: list.cards
        .filter(card => !card.archived)
        .map(card => {
          console.log('Processing card:', card.id, 'description:', card.description, 'due_date:', card.due_date)
          
          const cardLabelsForCard = cardLabels
            .filter(cl => cl.card_id === card.id)
            .map(cl => cl.label)

          const cardAssigneesForCard = cardAssignees
            .filter(ca => ca.card_id === card.id)
            .map(ca => ca.user)

          const cardCommentsForCard = cardComments
            .filter(cc => cc.card_id === card.id)

          return {
            id: card.id,
            title: card.title,
            description: card.description,
            position: card.position,
            due_date: card.due_date,
            labels: cardLabelsForCard,
            assignees: cardAssigneesForCard,
            comments: cardCommentsForCard,
            created_by: card.created_by,
            created_at: card.created_at,
            updated_at: card.updated_at
          }
        })
        .sort((a, b) => a.position - b.position)
    }))

    const response = {
      board: {
        id: board.id,
        title: board.title,
        visibility: board.visibility,
        workspace: board.workspace,
        created_by: board.created_by_profile,
        created_at: board.created_at,
        updated_at: board.updated_at
      },
      lists: processedLists,
      labels,
      activities,
      userRole: boardMember?.role || (board.created_by === userId ? 'owner' : 'viewer')
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error in GET /api/boards/[id]:', error)
    if (error.message === 'Unauthorized' || error.message === 'Invalid token' || error.message === 'Token expired') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = await getCurrentUser()
    const { id } = await params
    const body = await request.json()
    
    const supabase = await getSupabaseClient()
    
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('created_by, visibility')
      .eq('id', id)
      .single()

    if (boardError) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    const { data: boardMember } = await supabase
      .from('board_members')
      .select('role')
      .eq('board_id', id)
      .eq('user_id', userId)
      .single()

    const canEdit = board.created_by === userId || 
                   boardMember?.role === 'owner' || 
                   boardMember?.role === 'editor'

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
    }
  
    const { data: updatedBoard, error: updateError } = await supabase
      .from('boards')
      .update({
        title: body.title,
        visibility: body.visibility,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating board:', updateError)
      return NextResponse.json({ error: 'Failed to update board' }, { status: 500 })
    }

    await supabase
      .from('activities')
      .insert({
        board_id: id,
        actor_id: userId,
        type: 'list.renamed',
        data: {
          old_title: board.title,
          new_title: body.title
        }
      })

    return NextResponse.json(updatedBoard)
    
  } catch (error) {
    console.error('Error in PUT /api/boards/[id]:', error)
    if (error.message === 'Unauthorized' || error.message === 'Invalid token' || error.message === 'Token expired') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getCurrentUser()
    const { id } = await params
    
    const supabase = await getSupabaseClient()
    
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('created_by')
      .eq('id', id)
      .single()

    if (boardError) {
      console.error('Error fetching board:', boardError)
      return NextResponse.json({ error: 'Board not found' }, { status: 404 })
    }

    if (board.created_by !== userId) {
      return NextResponse.json({ error: 'Forbidden - only board owner can delete' }, { status: 403 })
    }

    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id')
      .eq('board_id', id)

    if (cardsError) {
      console.error('Error fetching cards for board:', cardsError)
      return NextResponse.json({ error: 'Failed to fetch cards for board' }, { status: 500 })
    }

    if (cards && cards.length > 0) {
      const cardIds = cards.map(card => card.id)

      const { error: commentsDeleteError } = await supabase
        .from('comments')
        .delete()
        .in('card_id', cardIds)

      if (commentsDeleteError) {
        console.error('Error deleting comments:', commentsDeleteError)
        return NextResponse.json({ error: 'Failed to delete comments' }, { status: 500 })
      }

      const { error: assigneesDeleteError } = await supabase
        .from('card_assignees')
        .delete()
        .in('card_id', cardIds)

      if (assigneesDeleteError) {
        console.error('Error deleting card assignees:', assigneesDeleteError)
        return NextResponse.json({ error: 'Failed to delete card assignees' }, { status: 500 })
      }

      const { error: cardLabelsDeleteError } = await supabase
        .from('card_labels')
        .delete()
        .in('card_id', cardIds)

      if (cardLabelsDeleteError) {
        console.error('Error deleting card labels:', cardLabelsDeleteError)
        return NextResponse.json({ error: 'Failed to delete card labels' }, { status: 500 })
      }
    }

    const { error: cardsDeleteError } = await supabase
      .from('cards')
      .delete()
      .eq('board_id', id)

    if (cardsDeleteError) {
      console.error('Error deleting cards:', cardsDeleteError)
      return NextResponse.json({ error: 'Failed to delete cards' }, { status: 500 })
    }

    const { error: listsDeleteError } = await supabase
      .from('lists')
      .delete()
      .eq('board_id', id)

    if (listsDeleteError) {
      console.error('Error deleting lists:', listsDeleteError)
      return NextResponse.json({ error: 'Failed to delete lists' }, { status: 500 })
    }

    const { error: labelsDeleteError } = await supabase
      .from('labels')
      .delete()
      .eq('board_id', id)

    if (labelsDeleteError) {
      console.error('Error deleting labels:', labelsDeleteError)
      return NextResponse.json({ error: 'Failed to delete labels' }, { status: 500 })
    }

    const { error: membersDeleteError } = await supabase
      .from('board_members')
      .delete()
      .eq('board_id', id)

    if (membersDeleteError) {
      console.error('Error deleting board members:', membersDeleteError)
      return NextResponse.json({ error: 'Failed to delete board members' }, { status: 500 })
    }

    const { error: activitiesDeleteError } = await supabase
      .from('activities')
      .delete()
      .eq('board_id', id)

    if (activitiesDeleteError) {
      console.error('Error deleting activities:', activitiesDeleteError)
      return NextResponse.json({ error: 'Failed to delete activities' }, { status: 500 })
    }

    const { error: deleteError } = await supabase
      .from('boards')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting board:', deleteError)
      return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 })
    }

    console.log('Delete API: Board deleted successfully')
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in DELETE /api/boards/[id]:', error)
    if (error.message === 'Unauthorized' || error.message === 'Invalid token' || error.message === 'Token expired') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
