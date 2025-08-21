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
      
      const { data: boards, error: boardsError } = await supabase
        .from('boards')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
      
      if (boardsError) {
        console.error('Error fetching boards:', boardsError)
        return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 })
      }
      
      return NextResponse.json(boards || [])
      
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
