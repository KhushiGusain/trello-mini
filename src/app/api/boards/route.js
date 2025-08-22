import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
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
      console.log('Boards API: Authenticated user:', userId)
      
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
      
      const { data: ownedBoards, error: ownedBoardsError } = await supabase
        .from('boards')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
      
      if (ownedBoardsError) {
        console.error('Error fetching owned boards:', ownedBoardsError)
        return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 })
      }

      const { data: memberBoards, error: memberBoardsError } = await supabase
        .from('board_members')
        .select(`
          board:boards(*)
        `)
        .eq('user_id', userId)
        .eq('board.visibility', 'workspace')
      
      if (memberBoardsError) {
        console.error('Error fetching member boards:', memberBoardsError)
      }

      const ownedBoardIds = new Set(ownedBoards?.map(board => board.id) || [])
      const memberBoardData = memberBoards?.map(mb => mb.board).filter(board => !ownedBoardIds.has(board.id)) || []
      
      const allBoards = [
        ...(ownedBoards || []),
        ...memberBoardData
      ]

      const uniqueBoards = allBoards.filter((board, index, self) => 
        index === self.findIndex(b => b.id === board.id)
      )
      
      return NextResponse.json(uniqueBoards || [])
      
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
  } catch (error) {
    console.error('Error in boards GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
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
      console.log('Boards API: Creating board for user:', userId)
      
      const { title, visibility = 'workspace', backgroundColor = '#3a72ee' } = await request.json()
      
      if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      }
      
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
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
      }
      
      if (!profile) {
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            display_name: 'User',
            email: payload.email || 'user@example.com'
          })
          .select()
          .single()
        
        if (createProfileError) {
          console.error('Error creating profile:', createProfileError)
          return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
        }
      }
      
      let { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('created_by', userId)
        .single()
      
      if (workspaceError && workspaceError.code !== 'PGRST116') {
        console.error('Error fetching workspace:', workspaceError)
        return NextResponse.json({ error: 'Failed to fetch workspace' }, { status: 500 })
      }
      
      if (!workspace) {
        const { data: newWorkspace, error: createError } = await supabase
          .from('workspaces')
          .insert({
            name: 'My Workspace',
            created_by: userId
          })
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating workspace:', createError)
          return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
        }
        
        workspace = newWorkspace
      }
      
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert({
          title,
          visibility,
          workspace_id: workspace.id,
          created_by: userId,
          background_color: backgroundColor
        })
        .select()
        .single()
      
      if (boardError) {
        console.error('Error creating board:', boardError)
        return NextResponse.json({ error: 'Failed to create board' }, { status: 500 })
      }
      
      return NextResponse.json(board)
      
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
  } catch (error) {
    console.error('Error in boards POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
