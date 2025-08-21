import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies()
    
    const customToken = cookieStore.get('sb-auth-token')?.value
    if (!customToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    try {
      const tokenParts = customToken.split('.')
      if (tokenParts.length !== 3) {
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
      }
      
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
      
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 })
      }
      
      const userId = payload.sub
      const { id } = params
      
      console.log('Delete API: Deleting board for user:', userId, 'Board ID:', id)
      
      const supabase = createServerClient(
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
      
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
  } catch (error) {
    console.error('Error in DELETE /api/boards/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
