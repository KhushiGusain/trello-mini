# Low-Level Design (LLD) – Mini Trello

## API Design

### **Workspace APIs**

- **GET /api/workspaces** → Get all workspaces of the logged-in user
- **POST /api/workspaces** → Create a new workspace { name, description? }
- **GET /api/workspaces/{id}** → Get details of a workspace
- **DELETE /api/workspaces/{id}** → Delete a workspace
- **GET /api/workspaces/{id}/members** → List workspace members
- **POST /api/workspaces/{id}/members** → Add a member to workspace

### **Board APIs**

- **GET /api/boards?workspace_id={id}** → Get all boards inside a workspace
- **POST /api/boards** → Create a new board { title, workspace_id, background_color? }
- **GET /api/boards/{id}** → Get board details
- **PUT /api/boards/{id}** → Update board info
- **DELETE /api/boards/{id}** → Delete board

### **List APIs**

- **GET /api/boards/{id}/lists** → Get lists of a board (with cards inside)
- **POST /api/boards/{id}/lists** → Create a list { title, position }
- **PUT /api/boards/{id}/lists/{listId}** → Update list
- **DELETE /api/boards/{id}/lists/{listId}** → Delete list

### **Card APIs**

- **GET /api/boards/{id}/cards** → Get cards of a board
- **POST /api/boards/{id}/cards** → Create a card { title, list_id, position, description? }
- **PUT /api/boards/{id}/cards/{cardId}** → Update card (title, description, due_date, etc.)
- **DELETE /api/boards/{id}/cards/{cardId}** → Delete card

## Main Modules

### **Auth Context**
- Manages login, signup, logout, and session
- Stores user info and session state
- Uses Supabase Auth with JWT tokens

### **Workspace Context**
- Tracks current workspace and workspace list
- Handles creating, switching, and deleting workspaces
- Fetches workspace members

### **Presence Context**
- Tracks which users are online
- Shows real-time presence indicators (online/offline, last seen)
- Uses Supabase Realtime channels

## Database Design

### **Core Tables**
- **profiles** → User profiles (linked to Supabase auth.users)
- **workspaces** → Workspace info (id, name, created_by)
- **boards** → Boards inside a workspace (title, color, visibility)
- **lists** → Lists inside a board (title, position)
- **cards** → Cards inside a list (title, description, position, due_date)

### **Junction Tables**
- **workspace_members** → Links users to workspaces with roles (owner, admin, member)
- **board_members** → Links users to boards with roles (owner, editor, viewer)
- **card_labels** → Links cards to labels
- **card_assignees** → Links cards to assigned users

### **Supporting Tables**
- **labels** → Labels for boards (name, color_hex)
- **comments** → Comments on cards (body, author_id)
- **activities** → Activity log (type, data, actor_id)

## Error Model

### **Error Response Format**
```json
{
  "error": "ERROR_TYPE",
  "message": "Readable error message",
  "status": 400
}
```
