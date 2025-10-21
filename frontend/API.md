# QuickNotes API Documentation

This document describes the API endpoints used by the QuickNotes frontend application.

## Base URL

```
http://localhost:8080/api
```

Configure via environment variable: `VITE_API_URL`

## Authentication

The API uses JWT (JSON Web Token) authentication. After login/registration, include the token in all requests:

```
Authorization: Bearer <token>
```

The frontend automatically handles this via Axios interceptors.

## Endpoints

### Authentication

#### Register

Create a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input or email already exists
- `500 Internal Server Error` - Server error

---

#### Login

Authenticate existing user.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Invalid input

---

#### Get Profile

Get current user profile (requires authentication).

```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

### Notes

All note endpoints require authentication.

#### Get All Notes

Get all notes for the authenticated user. Supports filtering by tags.

```http
GET /notes
Authorization: Bearer <token>

# Optional: Filter by tags
GET /notes?tags=work,important
```

**Query Parameters:**
- `tags` (optional) - Comma-separated list of tags

**Response (200 OK):**

```json
[
  {
    "id": "uuid",
    "title": "My First Note",
    "content": "This is the content of my note",
    "tags": ["work", "important"],
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "title": "Another Note",
    "content": "More content here",
    "tags": ["personal"],
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

**Note:** Tag filtering results are cached in Redis for improved performance.

---

#### Get Single Note

Get a specific note by ID.

```http
GET /notes/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "title": "My Note",
  "content": "Note content",
  "tags": ["work"],
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Note not found or not owned by user

---

#### Create Note

Create a new note.

```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Note",
  "content": "This is a new note",
  "tags": ["work", "important"]
}
```

**Request Body:**
- `title` (required, string) - Note title
- `content` (required, string) - Note content
- `tags` (optional, array) - Array of tag strings

**Response (201 Created):**

```json
{
  "id": "uuid",
  "title": "New Note",
  "content": "This is a new note",
  "tags": ["work", "important"],
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid or missing token

---

#### Update Note

Update an existing note.

```http
PATCH /notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["work", "done"]
}
```

**Request Body:**
All fields are optional:
- `title` (string) - Updated title
- `content` (string) - Updated content
- `tags` (array) - Updated tags array

**Response (200 OK):**

```json
{
  "id": "uuid",
  "title": "Updated Title",
  "content": "Updated content",
  "tags": ["work", "done"],
  "userId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Note not found or not owned by user

---

#### Delete Note

Delete a note.

```http
DELETE /notes/:id
Authorization: Bearer <token>
```

**Response (200 OK or 204 No Content):**

```json
{
  "message": "Note deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Note not found or not owned by user

---

## Error Response Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message description",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error (server error)

## Frontend Implementation

### API Service

The frontend uses a centralized API service ([src/services/api.ts](src/services/api.ts)) that:

1. **Automatically includes JWT token** in all requests
2. **Handles 401 responses** by redirecting to login
3. **Provides typed methods** for all endpoints
4. **Uses Axios interceptors** for request/response handling

### Usage Example

```typescript
import { apiService } from './services/api';

// Login
const { access_token, user } = await apiService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get notes
const notes = await apiService.getNotes();

// Filter by tags
const workNotes = await apiService.getNotes(['work']);

// Create note
const newNote = await apiService.createNote({
  title: 'My Note',
  content: 'Content here',
  tags: ['work']
});

// Update note
const updated = await apiService.updateNote('note-id', {
  title: 'Updated Title'
});

// Delete note
await apiService.deleteNote('note-id');
```

## Rate Limiting

The API may implement rate limiting. Check response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

## CORS

The backend must allow requests from the frontend origin:

```typescript
// Backend CORS configuration
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

## Health Check

Check API availability:

```http
GET /health
```

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Caching

Tag-based note queries are cached in Redis with:
- **Key format**: `notes:user:{userId}:tags:{tag1,tag2}`
- **TTL**: Configurable (typically 5-10 minutes)
- **Invalidation**: On note create/update/delete

## WebSocket Support

Not currently implemented. Future versions may add:
- Real-time note updates
- Collaborative editing
- Live notifications

## API Versioning

Current version: `v1` (implicit in base path `/api`)

Future versions will use: `/api/v2`, `/api/v3`, etc.
