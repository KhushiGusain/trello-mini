## Authentication

All endpoints require a Supabase JWT. Pass it in the Authorization header:

```
Authorization: Bearer <token>
```

## Workspaces

- **GET** `/api/workspaces` → Get all workspaces of the logged-in user
- **POST** `/api/workspaces` → Create a new workspace
- **GET** `/api/workspaces/{id}` → Get workspace details
- **DELETE** `/api/workspaces/{id}` → Delete a workspace
- **GET** `/api/workspaces/{id}/members` → Get workspace members
- **POST** `/api/workspaces/{id}/members` → Add a member by email

## Boards

- **GET** `/api/boards?workspace_id={id}` → Get boards in a workspace
- **POST** `/api/boards` → Create a new board
- **GET** `/api/boards/{id}` → Get board details
- **PUT** `/api/boards/{id}` → Update board info
- **DELETE** `/api/boards/{id}` → Delete a board
- **GET** `/api/boards/{id}/members` → Get board members
- **POST** `/api/boards/{id}/members` → Add board member

## Lists

- **GET** `/api/boards/{id}/lists` → Get all lists in a board (with cards)
- **POST** `/api/boards/{id}/lists` → Create a new list
- **PUT** `/api/boards/{id}/lists/{listId}` → Update a list
- **DELETE** `/api/boards/{id}/lists/{listId}` → Delete a list

## Cards

- **GET** `/api/boards/{id}/cards` → Get all cards in a board
- **POST** `/api/boards/{id}/cards` → Create a new card
- **GET** `/api/boards/{id}/cards/{cardId}` → Get card details
- **PUT** `/api/boards/{id}/cards/{cardId}` → Update a card
- **DELETE** `/api/boards/{id}/cards/{cardId}` → Delete a card
- **POST** `/api/boards/{id}/cards/{cardId}/comments` → Add a comment
- **GET** `/api/boards/{id}/cards/{cardId}/comments` → Get comments

## Labels & Assignees

- **POST** `/api/boards/{id}/labels` → Create label
- **GET** `/api/boards/{id}/labels` → List labels in a board
- **POST** `/api/boards/{id}/cards/{cardId}/labels` → Add label to a card
- **POST** `/api/boards/{id}/cards/{cardId}/assignees` → Assign a user to a card

## Errors

All errors return JSON in this format:

```json
{
  "error": "UNAUTHORIZED",
  "message": "You must be logged in"
}
```

### Common errors:

- **401 Unauthorized** – Missing/invalid token
- **403 Forbidden** – Not enough permissions
- **404 Not Found** – Resource doesn't exist
- **409 Conflict** – Already exists
