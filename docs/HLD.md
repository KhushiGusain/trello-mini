# High-Level Design (HLD) - Mini Trello

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Mini Trello Architecture                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Frontend      │    │   Supabase      │                │
│  │   (Next.js)     │◄──►│   Backend       │                │
│  │                 │    │                 │                │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │                │
│  │ │   Pages     │ │    │ │   Database  │ │                │
│  │ │   (App      │ │    │ │  (PostgreSQL│ │                │
│  │ │   Router)   │ │    │ │   + RLS)    │ │                │
│  │ └─────────────┘ │    │ └─────────────┘ │                │
│  │                 │    │                 │                │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │                │
│  │ │ Components  │ │    │ │   Auth      │ │                │
│  │ │   (React)   │ │    │ │  (Supabase  │ │                │
│  │ └─────────────┘ │    │ │   Auth)     │ │                │
│  │                 │    │ └─────────────┘ │                │
│  │ ┌─────────────┐ │    │                 │                │
│  │ │   Context   │ │    │ ┌─────────────┐ │                │
│  │ │  (State     │ │    │ │  Realtime   │ │                │
│  │ │  Management)│ │    │ │  (WebSocket │ │                │
│  │ └─────────────┘ │    │ │   + Presence│ │                │
│  │                 │    │ │   API)      │ │                │
│  └─────────────────┘    │ └─────────────┘ │                │
│                         │                 │                │
│                         │ ┌─────────────┐ │                │
│                         │ │   Storage   │ │                │
│                         │ │  (Optional) │ │                │
│                         │ └─────────────┘ │                │
│                         └─────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Major Components

### **Frontend (Next.js)**
- **Pages** - App Router with server-side rendering
- **Components** - React components for UI elements
- **Context** - State management for auth, workspace, presence

### **Backend (Supabase)**
- **Database** - PostgreSQL with Row Level Security (RLS)
- **Auth** - Supabase Auth with JWT tokens
- **Realtime** - WebSocket-based real-time updates
- **Storage** - Optional file storage

## 🔄 Data Flows

### **Authentication Flow**
```
User Login → Supabase Auth → AuthContext → Route Protection → App Access
```

### **Workspace Operations**
```
User Action → WorkspaceContext → API Call → Database Update → UI Update
```

### **Board Operations**
```
User Action → Component → API Route → Database → Real-time Update → UI Refresh
```

### **Real-time Updates**
```
User Activity → PresenceContext → Supabase Channel → Real-time Update → UI Indicator
```

## Real-time Choice & Why

### **WebSockets via Supabase Realtime**

**Why WebSockets over SSE (Server-Sent Events)?**
- **Bidirectional Communication** - Two-way real-time updates
- **Built-in Presence API** - Ready-to-use user presence management
- **Automatic Reconnection** - Handles network disconnections gracefully
- **Database Subscriptions** - Real-time database change notifications
- **Integrated Authentication** - Seamless integration with Supabase Auth

**Implementation:**
```javascript
const channel = supabase.channel('online-users', {
  config: {
    presence: {
      key: user.id,
    },
  },
})
```

##  Deployment Strategy

### **Vercel + Supabase**

**Frontend (Vercel):**
- GitHub repository integration
- Automatic deployments on push
- Global CDN for fast loading
- Built-in Next.js optimization

**Backend (Supabase):**
- Managed PostgreSQL database
- Built-in authentication system
- Real-time WebSocket connections
- Row Level Security (RLS)


## Security

### **JWT + RLS**

**Authentication (JWT):**
- Supabase Auth with secure JWT tokens
- Automatic token refresh
- Session management

**Authorization (RLS):**
- Row Level Security policies
- Workspace-based access control
- Board-level permissions
- Data isolation between users
