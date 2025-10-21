# QuickNotes Frontend - Project Structure

## Directory Tree

```
quicknotes-frontend/
│
├── 📁 public/
│   └── vite.svg                    # Vite logo favicon
│
├── 📁 src/
│   ├── 📁 components/              # Reusable UI Components
│   │   ├── NoteCard.tsx            # Individual note display card
│   │   ├── NoteModal.tsx           # Create/edit note modal dialog
│   │   ├── ProtectedRoute.tsx     # Authentication route guard
│   │   └── TagFilter.tsx           # Multi-select tag filter
│   │
│   ├── 📁 contexts/                # React Contexts
│   │   └── AuthContext.tsx         # Authentication state management
│   │
│   ├── 📁 pages/                   # Page Components (Routes)
│   │   ├── Dashboard.tsx           # Main notes dashboard
│   │   ├── Login.tsx               # Login page
│   │   └── Register.tsx            # Registration page
│   │
│   ├── 📁 services/                # API Services
│   │   └── api.ts                  # Axios API client with interceptors
│   │
│   ├── 📁 styles/                  # CSS Stylesheets
│   │   ├── Auth.css                # Authentication pages styling
│   │   ├── Dashboard.css           # Dashboard styling
│   │   └── global.css              # Global styles & variables
│   │
│   ├── 📁 types/                   # TypeScript Definitions
│   │   └── index.ts                # Application type definitions
│   │
│   ├── App.tsx                     # Main app component with routing
│   ├── main.tsx                    # Application entry point
│   └── vite-env.d.ts               # Vite environment types
│
├── 📁 node_modules/                # Dependencies (gitignored)
├── 📁 dist/                        # Production build output (gitignored)
│
├── .dockerignore                   # Docker ignore patterns
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment variables template
├── .eslintrc.cjs                   # ESLint configuration
├── .gitignore                      # Git ignore patterns
│
├── 📄 API.md                       # Complete API documentation
├── 📄 Dockerfile                   # Production Docker image
├── 📄 Dockerfile.dev               # Development Docker image (hot reload)
├── 📄 Makefile                     # Build & deployment commands
├── 📄 PROJECT_SUMMARY.md           # Project overview
├── 📄 QUICKSTART.md                # Quick setup guide
├── 📄 README.md                    # Main documentation
├── 📄 STRUCTURE.md                 # This file
│
├── docker-compose.yml              # Production Docker Compose
├── docker-compose.dev.yml          # Development Docker Compose
├── index.html                      # HTML entry point
├── nginx.conf                      # Nginx configuration for production
│
├── package.json                    # Dependencies & scripts
├── package-lock.json               # Dependency lock file
│
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TypeScript config for Node.js
└── vite.config.ts                  # Vite configuration
```

## Component Hierarchy

```
App (BrowserRouter)
│
├── AuthProvider (Context)
│   │
│   ├── /login → Login
│   │   └── Form + Validation
│   │
│   ├── /register → Register
│   │   └── Form + Validation
│   │
│   └── /dashboard → ProtectedRoute
│       └── Dashboard
│           ├── Header (User info + Logout)
│           ├── Controls
│           │   ├── New Note Button
│           │   └── TagFilter
│           │       └── Multi-select dropdown
│           │
│           ├── Notes Grid
│           │   └── NoteCard (multiple)
│           │       ├── Title + Content
│           │       ├── Tags
│           │       └── Actions (Edit/Delete)
│           │
│           └── NoteModal (conditional)
│               └── Form (Title/Content/Tags)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Actions                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      React Components                        │
│  (Login, Register, Dashboard, NoteCard, NoteModal, etc.)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Service Layer                       │
│         (src/services/api.ts - Axios + Interceptors)        │
│                                                              │
│  • Injects JWT token from localStorage                      │
│  • Handles 401 → redirect to login                          │
│  • Transforms requests/responses                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend API (NestJS)                     │
│              http://localhost:8080/api                       │
│                                                              │
│  • /auth/* - Authentication endpoints                       │
│  • /notes/* - Notes CRUD endpoints                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL + Redis Cache                    │
│                                                              │
│  • PostgreSQL: User & Note storage                          │
│  • Redis: Tag query caching                                 │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Enters credentials
     ▼
┌─────────────────┐
│  Login/Register │
│      Page       │
└────┬────────────┘
     │ 2. Submits form
     ▼
┌─────────────────┐
│   API Service   │────── POST /auth/login
└────┬────────────┘
     │ 3. Returns token + user
     ▼
┌─────────────────┐
│  AuthContext    │
│  - setUser()    │
│  - Store token  │
└────┬────────────┘
     │ 4. Update state
     ▼
┌─────────────────┐
│  localStorage   │
│  - access_token │
│  - user         │
└────┬────────────┘
     │ 5. Navigate to Dashboard
     ▼
┌─────────────────┐
│ Protected Route │
│   (Dashboard)   │
└─────────────────┘
```

## State Management

```
┌──────────────────────────────────────────────────────────┐
│                   Global State (Context)                  │
│                                                           │
│  AuthContext:                                             │
│  - user: User | null                                      │
│  - isAuthenticated: boolean                               │
│  - isLoading: boolean                                     │
│  - login(data): Promise<void>                             │
│  - register(data): Promise<void>                          │
│  - logout(): void                                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              Local State (Component-specific)             │
│                                                           │
│  Dashboard:                                               │
│  - notes: Note[]                                          │
│  - filteredNotes: Note[]                                  │
│  - selectedTags: string[]                                 │
│  - allTags: string[]                                      │
│  - isModalOpen: boolean                                   │
│  - editingNote: Note | null                               │
│  - isLoading: boolean                                     │
│  - error: string                                          │
└──────────────────────────────────────────────────────────┘
```

## Build Process

```
┌─────────────────┐
│  Source Code    │
│   (src/*.tsx)   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   TypeScript    │
│    Compiler     │────── Type checking
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│      Vite       │
│   Bundler       │────── Tree-shaking, minification
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│   dist/         │
│   - index.html  │
│   - index.js    │────── ~212 KB (70 KB gzipped)
│   - index.css   │────── ~7 KB (2 KB gzipped)
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│     Nginx       │────── Serves static files
│  (Production)   │        SPA routing
└─────────────────┘        Gzip compression
```

## Docker Architecture

### Production
```
┌──────────────────────────────────────┐
│         Dockerfile (Multi-stage)      │
├──────────────────────────────────────┤
│                                       │
│  Stage 1: Build                       │
│  - FROM node:18-alpine                │
│  - npm ci                             │
│  - npm run build                      │
│  - Output: dist/                      │
│                                       │
├──────────────────────────────────────┤
│                                       │
│  Stage 2: Production                  │
│  - FROM nginx:alpine                  │
│  - COPY dist/ → /usr/share/nginx/html │
│  - COPY nginx.conf                    │
│  - EXPOSE 3000                        │
│  - Health check on /health            │
│                                       │
└──────────────────────────────────────┘
```

### Development
```
┌──────────────────────────────────────┐
│        Dockerfile.dev (Single-stage)  │
├──────────────────────────────────────┤
│                                       │
│  - FROM node:18-alpine                │
│  - npm install                        │
│  - COPY source code                   │
│  - EXPOSE 3000                        │
│  - CMD ["npm", "run", "dev"]          │
│  - Hot reload via volumes             │
│                                       │
└──────────────────────────────────────┘
```

## API Integration Points

```
Component              API Endpoint              Method   Purpose
─────────────────────  ────────────────────────  ───────  ──────────────────
Login.tsx           →  /auth/login               POST     User login
Register.tsx        →  /auth/register            POST     User registration
AuthContext.tsx     →  /auth/profile             GET      Verify token
Dashboard.tsx       →  /notes                    GET      Fetch all notes
Dashboard.tsx       →  /notes?tags=work,home     GET      Filtered notes
Dashboard.tsx       →  /notes                    POST     Create note
Dashboard.tsx       →  /notes/:id                PATCH    Update note
Dashboard.tsx       →  /notes/:id                DELETE   Delete note
```

## Styling Architecture

```
global.css
├── CSS Variables (colors, spacing, shadows)
├── Reset & Base styles
├── Button styles (.btn-primary, .btn-secondary)
├── Form elements (input, textarea, label)
└── Utility classes (tag, error-message, loading)

Auth.css
├── .auth-container (centered layout)
├── .auth-card (login/register form)
└── .auth-form (form styling)

Dashboard.css
├── .dashboard (main layout)
├── .dashboard-header (top navigation)
├── .dashboard-controls (action buttons)
├── .notes-grid (responsive grid)
├── .note-card (individual note)
├── .note-modal (create/edit modal)
├── .tag-filter (filter dropdown)
└── @media queries (responsive)
```

## File Sizes

| File | Lines of Code | Purpose |
|------|---------------|---------|
| `Dashboard.tsx` | ~180 | Main dashboard with notes CRUD |
| `api.ts` | ~90 | API client service |
| `AuthContext.tsx` | ~80 | Authentication state |
| `NoteModal.tsx` | ~120 | Note create/edit form |
| `Login.tsx` | ~70 | Login page |
| `Register.tsx` | ~85 | Registration page |
| `NoteCard.tsx` | ~50 | Note display card |
| `TagFilter.tsx` | ~60 | Tag filter dropdown |
| `ProtectedRoute.tsx` | ~30 | Route guard |
| **Total** | **~765** | Total frontend code |

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:8080/api` | Backend API base URL |

## Ports

| Service | Port | Purpose |
|---------|------|---------|
| Frontend Dev | 3000 | Vite dev server |
| Frontend Prod | 3000 | Nginx static server |
| Backend API | 8080 | NestJS API (expected) |

## Key Design Patterns

1. **Container/Presenter Pattern**
   - Pages are containers (logic)
   - Components are presenters (UI)

2. **Service Layer Pattern**
   - API calls centralized in `api.ts`
   - Components call services, not raw Axios

3. **Context Provider Pattern**
   - Auth state in context
   - Accessible via `useAuth()` hook

4. **Protected Route Pattern**
   - Higher-order component wraps routes
   - Checks authentication before rendering

5. **Modal Pattern**
   - Overlay with backdrop
   - Shared for create/edit operations

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | UI framework |
| react-dom | 18.2.0 | React DOM rendering |
| react-router-dom | 6.20.0 | Client-side routing |
| axios | 1.6.2 | HTTP client |
| vite | 5.0.8 | Build tool |
| typescript | 5.2.2 | Type safety |

Total dependencies: **227 packages** (including transitive)

## Performance Characteristics

- **Initial Load**: < 1s (on fast connection)
- **Build Time**: ~571ms
- **Bundle Size**: 212 KB JS + 7 KB CSS (gzipped: 71 KB)
- **Hot Reload**: < 100ms (Vite HMR)
- **Lighthouse Score**: 95+ (estimated)

## Conclusion

This structure provides:
- Clear separation of concerns
- Scalable component architecture
- Type-safe API integration
- Production-ready Docker setup
- Comprehensive documentation
- Easy onboarding for new developers
