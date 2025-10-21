# 🔥 Hot Reload Development Guide

## Quick Start

### **Option 1: Using Make (Recommended)**

```bash
# Stop production containers
make down

# Start in development mode with hot reload
make dev

# View logs
make dev-logs
```

### **Option 2: Using Docker Compose Directly**

```bash
# Stop production containers
docker-compose down

# Start in development mode
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

---

## What You Get

### ✅ **Backend Hot Reload (NestJS)**
- Changes to `.ts` files in `backend/src/` auto-reload
- No need to rebuild Docker image
- ~2-5 second reload time
- TypeScript compilation happens automatically

### ✅ **Frontend Hot Reload (Vite)**
- Changes to `.tsx`, `.ts`, `.css` files in `frontend/src/` auto-reload
- Instant Hot Module Replacement (HMR)
- ~100-500ms reload time
- Preserves React component state

---

## How It Works

### **Volume Mapping**

Development mode mounts your source code into the containers:

```yaml
# Backend
volumes:
  - ./backend/src:/app/src    # Your code → Container

# Frontend
volumes:
  - ./frontend/src:/app/src   # Your code → Container
```

### **Watch Modes**

**Backend (NestJS):**
```bash
# Dockerfile.dev runs:
npm run start:dev  # NestJS watch mode
```

**Frontend (Vite):**
```bash
# Dockerfile.dev runs:
npm run dev  # Vite dev server with HMR
```

---

## Development Workflow

### **1. Start Development Mode**

```bash
make dev
# Or: docker-compose -f docker-compose.dev.yml up
```

Wait for all services to start (you'll see):
```
quicknotes-api-dev      | Application is running on: http://localhost:8080
quicknotes-frontend-dev | ➜  Local:   http://localhost:3000/
```

### **2. Make Changes**

**Backend Example:**
```bash
# Edit a file
vim backend/src/notes/notes.controller.ts

# Save the file
# Watch the logs - you'll see:
# [Nest] File change detected. Starting incremental compilation...
# [Nest] Successfully restarted
```

**Frontend Example:**
```bash
# Edit a file
vim frontend/src/pages/Dashboard.tsx

# Save the file
# Browser auto-refreshes or updates with HMR
```

### **3. Test Changes**

Changes are live immediately:
- **Frontend**: http://localhost:3000 (auto-refreshes)
- **Backend API**: http://localhost:8080/api (restarts automatically)

---

## Development vs Production

| Feature | Production | Development |
|---------|-----------|-------------|
| **Code Location** | Copied into image | Mounted as volume |
| **Rebuild Required** | Yes | No |
| **Hot Reload** | ❌ No | ✅ Yes |
| **Performance** | Optimized | Debug mode |
| **Image Size** | Smaller | Larger |
| **Use Case** | Deployment | Local dev |
| **Startup Time** | Faster | Slower |
| **Load Balancing** | 2 API instances | 1 API instance |

---

## File Watch Behavior

### **What Triggers Reload**

**Backend:**
- ✅ Any `.ts` file in `backend/src/`
- ✅ Controller changes
- ✅ Service changes
- ✅ Module changes
- ✅ Entity changes
- ❌ `package.json` changes (need rebuild)
- ❌ Environment variables (need restart)

**Frontend:**
- ✅ Any `.tsx`, `.ts` file in `frontend/src/`
- ✅ Any `.css` file in `frontend/src/`
- ✅ Component changes
- ✅ Style changes
- ❌ `package.json` changes (need rebuild)
- ❌ `vite.config.ts` changes (need restart)

---

## Common Commands

```bash
# Start dev mode
make dev

# Stop dev mode
make dev-down

# Rebuild dev images (if package.json changed)
make dev-build

# View logs
make dev-logs

# Restart a specific service
docker-compose -f docker-compose.dev.yml restart api
docker-compose -f docker-compose.dev.yml restart frontend

# Check status
docker-compose -f docker-compose.dev.yml ps

# Stop all
docker-compose -f docker-compose.dev.yml down
```

---

## Troubleshooting

### **Changes Not Reflecting**

**For Backend:**
```bash
# Check if volume is mounted correctly
docker-compose -f docker-compose.dev.yml exec api ls -la /app/src

# Restart the API
docker-compose -f docker-compose.dev.yml restart api

# Check logs for errors
docker-compose -f docker-compose.dev.yml logs api
```

**For Frontend:**
```bash
# Check if volume is mounted correctly
docker-compose -f docker-compose.dev.yml exec frontend ls -la /app/src

# Restart frontend
docker-compose -f docker-compose.dev.yml restart frontend

# Check Vite logs
docker-compose -f docker-compose.dev.yml logs frontend
```

### **Added New npm Package**

When you modify `package.json`, you need to rebuild:

```bash
# Stop containers
make dev-down

# Rebuild images
make dev-build

# Start again
make dev
```

### **Port Already in Use**

```bash
# Kill process using port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process using port 8080 (backend)
lsof -ti:8080 | xargs kill -9

# Restart dev mode
make dev
```

### **Changes Are Slow**

This can happen on macOS due to file system performance. Solutions:

1. **Use fewer files**: Keep `node_modules` out of mounted volumes (already configured)
2. **Restart occasionally**: `docker-compose -f docker-compose.dev.yml restart api frontend`
3. **Check resources**: Ensure Docker Desktop has enough memory/CPU

---

## Performance Tips

### **1. Selective Mounting**

We only mount `src/` directories, not the entire project:

```yaml
# ✅ Good - Only source code
volumes:
  - ./backend/src:/app/src

# ❌ Bad - Everything (slow on macOS)
volumes:
  - ./backend:/app
```

### **2. Exclude node_modules**

`node_modules` stays in the container (not mounted from host):

```dockerfile
# package.json is copied
COPY package*.json ./
RUN npm install

# But node_modules is NOT in the volume mount
```

### **3. Use Docker Desktop Settings**

Allocate sufficient resources:
- **CPUs**: 4+
- **Memory**: 6GB+
- **Disk**: 20GB+

---

## Switching Between Modes

### **From Production to Development**

```bash
# Stop production
docker-compose down

# Start development
make dev
```

### **From Development to Production**

```bash
# Stop development
docker-compose -f docker-compose.dev.yml down

# Start production
make up
```

---

## Example Development Session

```bash
# 1. Start dev mode
make dev

# 2. Open your editor
code backend/src/notes/notes.controller.ts

# 3. Make a change (add a console.log)
@Get()
async findAll(@Request() req, @Query('tags') tags?: string) {
  console.log('📝 Fetching notes for user:', req.user.id);  // Added this
  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
  return this.notesService.findAll(req.user.id, tagsArray);
}

# 4. Save the file (Cmd+S)

# 5. Watch the terminal - you'll see:
# [Nest] File change detected. Starting incremental compilation...
# [Nest] Compilation successful.
# [Nest] Successfully restarted

# 6. Test the change
curl http://localhost:8080/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN"

# 7. See the console.log in the terminal:
# 📝 Fetching notes for user: 123e4567-e89b-12d3-a456-426614174000
```

---

## Best Practices

### ✅ **Do:**
- Use dev mode for development
- Keep changes small and test frequently
- Watch the logs for errors
- Commit working code before major changes

### ❌ **Don't:**
- Edit files inside the container (changes won't persist)
- Run production and dev mode simultaneously (port conflicts)
- Mount entire project directory (slow on macOS)
- Forget to rebuild after `package.json` changes

---

## Quick Reference

```bash
# Most common commands

# Start dev with hot reload
make dev

# Stop dev
make dev-down

# Rebuild (after package.json changes)
make dev-build && make dev

# View logs
make dev-logs

# Restart specific service
docker-compose -f docker-compose.dev.yml restart api
```

---

## Summary

✅ **Hot reload is already configured!**
✅ **Just run `make dev` to start**
✅ **Edit files in `backend/src/` or `frontend/src/`**
✅ **Changes apply automatically**
✅ **No rebuild needed for code changes**

**Happy coding! 🚀**
