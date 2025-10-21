# QuickNotes Frontend

A modern, responsive React + Vite frontend for the QuickNotes application - a mini SaaS app for personal note-taking with tag-based organization and search functionality.

## Features

- **User Authentication**: JWT-based authentication with login/registration
- **Notes Management**: Full CRUD operations for notes (Create, Read, Update, Delete)
- **Tag System**: Organize notes with tags and filter by multiple tags
- **Redis-Cached Search**: Backend caching for optimized tag-based queries
- **Responsive Design**: Mobile-friendly UI with modern styling
- **Protected Routes**: Secure routing with authentication guards
- **Real-time Updates**: Instant UI updates after note operations

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS with CSS Variables
- **Containerization**: Docker & Docker Compose

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── NoteCard.tsx     # Note display card
│   │   ├── NoteModal.tsx    # Create/edit note modal
│   │   ├── TagFilter.tsx    # Tag filtering component
│   │   └── ProtectedRoute.tsx # Route guard
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── pages/               # Page components
│   │   ├── Login.tsx        # Login page
│   │   ├── Register.tsx     # Registration page
│   │   └── Dashboard.tsx    # Main notes dashboard
│   ├── services/            # API services
│   │   └── api.ts           # API client with JWT interceptors
│   ├── styles/              # CSS stylesheets
│   │   ├── global.css       # Global styles
│   │   ├── Auth.css         # Authentication pages styles
│   │   └── Dashboard.css    # Dashboard styles
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Application types
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite environment types
├── Dockerfile               # Production Docker image
├── Dockerfile.dev           # Development Docker image
├── nginx.conf               # Nginx configuration for production
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_API_URL=http://localhost:8080/api
```

For Docker Compose setup, the API URL should point to the load balancer:

```bash
VITE_API_URL=http://localhost:8080/api
```

## Local Development

### Prerequisites

- Node.js 18+ (Note: Node.js 20.19.0+ or 22.12.0+ required for latest Vite)
- npm or yarn

### Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Docker Deployment

### Development Mode (with hot reload)

```bash
# Build development image
docker build -f Dockerfile.dev -t quicknotes-frontend:dev .

# Run development container
docker run -p 3000:3000 \
  -v $(pwd)/src:/app/src \
  -e VITE_API_URL=http://localhost:8080/api \
  quicknotes-frontend:dev
```

### Production Mode

```bash
# Build production image
docker build -t quicknotes-frontend:latest .

# Run production container
docker run -p 3000:3000 \
  -e VITE_API_URL=http://localhost:8080/api \
  quicknotes-frontend:latest
```

### Health Check

The container includes a health check endpoint:

```bash
curl http://localhost:3000/health
```

## Integration with Backend

### API Endpoints Used

The frontend connects to the following backend endpoints:

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

**Notes:**
- `GET /api/notes` - Get all notes (supports ?tags=tag1,tag2 query)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### JWT Token Management

- Tokens are stored in localStorage
- Automatically included in API requests via Axios interceptor
- Auto-redirect to login on 401 responses
- Token validation on app initialization

## Features in Detail

### Authentication Flow

1. User registers or logs in
2. Backend returns JWT token and user data
3. Token stored in localStorage
4. Token included in all subsequent API requests
5. Auto-logout on token expiration

### Notes CRUD

- **Create**: Modal form with title, content, and tags
- **Read**: Grid view with note cards
- **Update**: Edit existing notes via modal
- **Delete**: Confirmation before deletion

### Tag Filtering

- Extract all unique tags from user's notes
- Multi-select dropdown filter
- Backend caching via Redis for optimized queries
- Real-time filter application

### Protected Routes

- Dashboard requires authentication
- Auto-redirect to login if not authenticated
- Loading state during authentication check

## Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Nginx gzip compression
- **Caching**: Long-term caching for static assets
- **Redis Backend**: Cached tag queries for fast filtering

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features

- JWT token-based authentication
- HTTP-only recommendations for production
- XSS protection headers (nginx)
- CSRF protection via token validation
- Input validation and sanitization

## Troubleshooting

### CORS Issues

Ensure backend CORS is configured to allow frontend origin:

```typescript
// Backend NestJS configuration
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### API Connection Issues

1. Verify `VITE_API_URL` in `.env`
2. Check backend is running on specified port
3. Test API endpoints with curl/Postman

### Build Issues

If you encounter Node.js version issues:
- Use Node.js 18.x for better compatibility
- Or upgrade to Node.js 20.19.0+ or 22.12.0+

## Production Deployment

### Build Steps

1. Set production environment variables
2. Build optimized bundle: `npm run build`
3. Serve via Nginx or CDN
4. Enable HTTPS
5. Configure proper CORS on backend

### Docker Compose Integration

When using with the full stack:

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://nginx:8080/api
    depends_on:
      - nginx
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

## Architecture Decisions

### Why Vite?

- Faster build times than Create React App
- Native ESM support
- Better development experience with HMR
- Smaller production bundles

### Why TypeScript?

- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

### State Management

- Context API for authentication state (simpler than Redux for small apps)
- Local component state for UI interactions
- No global state library needed for this scope

### Styling Approach

- CSS Modules considered but vanilla CSS chosen for simplicity
- CSS Variables for theming
- Mobile-first responsive design
- No UI library to minimize bundle size

## Future Enhancements

- [ ] Rich text editor for note content
- [ ] Note sharing between users
- [ ] Export notes to PDF/Markdown
- [ ] Drag-and-drop note reordering
- [ ] Dark mode toggle
- [ ] Collaborative real-time editing
- [ ] Offline support with Service Workers
- [ ] Note templates

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the development team.
