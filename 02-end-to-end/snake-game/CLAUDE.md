# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multiplayer snake game with real-time leaderboards and spectating. Features two game modes (walls and pass-through), user authentication, and interactive gameplay. Frontend is fully implemented with mocked backend for independent development.

## Key Technologies

**Frontend:**
- React 19 with Vite
- React Router v7 for client-side routing
- Canvas API for game rendering
- Vitest for testing with @testing-library/react
- TailwindCSS-like custom styling

**Backend (Ready for Integration):**
- Python 3.11 with Flask (skeleton ready)
- CORS-enabled for frontend integration

## Development Commands

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm run dev            # Start development server (http://localhost:5173)
npm test               # Run tests (48 comprehensive tests)
npm test -- --run      # Run tests once
npm run build          # Production build
```

### Backend
```bash
cd backend
uv sync               # Sync dependencies from lockfile
uv add <PACKAGE>      # Add a new package
uv run python app.py  # Run application (when implemented)
```

## Architecture Overview

### Frontend Structure
- **Components**: Modular React components for each feature (Login, Signup, GamePlay, Leaderboard, Watch)
- **Services**: Centralized API service (`api.js`) and game logic (`gameLogic.js`)
- **Contexts**: React Context for global auth state
- **Styles**: Modular CSS per feature with consistent dark theme

### Key Design Patterns
1. **Centralized API Service**: All backend calls go through `src/services/api.js`. Mock implementations allow frontend development without backend.
2. **Game Logic Separation**: Pure game logic in `gameLogic.js` with comprehensive test coverage.
3. **Auth Context**: Global authentication state via React Context Hook
4. **Canvas Rendering**: Direct canvas rendering for optimal game performance
5. **Dual-State Pattern for Game Loop**: Critical architectural decision implemented in `GamePlay.jsx`:
   - `gameStateRef` (useRef): Holds actual game state for immediate access in game logic
   - `gameState` (useState): Used only for triggering React re-renders
   - `nextDirectionRef` (useRef): Tracks pending direction changes without state batching delays
   - **Why**: React's state batching and closure behavior broke collision detection. By separating game logic (refs) from rendering (state), collisions are detected against current state immediately, not stale state from previous renders.
   - **Result**: Food collision detection now works reliably every time.
6. **Trail-Based Smooth Animation System**: Snake moves as one continuous piece following the head's path:
   - `trail`: Array storing the path the head has traveled (5 points per grid segment)
   - `trailRef`: Ref for immediate trail access without React state delays
   - `tickTime`: Timestamp of last game tick for calculating animation progress
   - **How it works**:
     - Each tick, interpolated points are added to the trail from newHead back to prevHead
     - Canvas renders by sliding through trail points based on animation progress
     - Sub-point interpolation between trail points for extra smoothness (60fps)
   - **Wrap-around handling**: Detects when adjacent trail points are far apart and skips interpolation to avoid visual glitches
   - **Visual style**: Circular segments with gradient from bright head to faded tail, eyes that follow direction

## Important Features Implemented

### Game Modes
- **Walls Mode**: Classic snake - hit walls and lose
- **Pass-Through Mode**: Wrap around edges

### Multiplayer Features
- User signup/login with persistent sessions
- Real-time leaderboard with auto-refresh (5 second interval)
- Spectate active players with mock game state
- Score tracking and high score management

### Testing
- 48 comprehensive tests covering:
  - Game logic (initialization, movement, collisions, modes, scoring)
  - API service (auth, leaderboard, game, spectating)
  - Authentication context and hooks

## Common Development Tasks

### Adding a New Game Feature
1. Add game logic to `src/services/gameLogic.js`
2. Write tests first in `gameLogic.test.js`
3. Use in GamePlay component
4. Update canvas rendering if needed

### Adding an API Endpoint
1. Define mock implementation in `src/services/api.js`
2. Add tests to `api.test.js`
3. Later, replace mock with actual backend call

### Creating a New Page
1. Create component in `src/components/`
2. Add route in `App.jsx`
3. Add navigation in Home component
4. Create accompanying CSS in `src/styles/`

## Mocking for Frontend Development

The API service is fully mocked with:
- Simulated network delays (200-700ms)
- Mock user database with demo credentials
- Mock game sessions and leaderboard data
- Live player simulation for spectating

**Demo Login**: username: `player1`, password: `password`

## Integration Checklist (Future Backend Implementation)

- [ ] Replace mock functions in `api.js` with real HTTP calls
- [ ] Handle JWT tokens for auth
- [ ] Implement error boundaries for API failures
- [ ] Add request timeout handling
- [ ] Set up CORS properly
- [ ] Handle session persistence
- [ ] Implement real-time updates (WebSocket for spectating)

## Performance Notes

- Game logic runs at ~6.7 moves/second (150ms per tick) while rendering runs at 60fps
- Canvas optimized for 20x20 grid with requestAnimationFrame for smooth 60fps rendering
- Pre-rendered grid canvas copied each frame for efficiency
- Trail-based animation with 5 interpolation points per segment
- Food generation is O(1) amortized with attempt limit of 100 tries
- Snake collision detection is O(n) where n = snake length
- Leaderboard auto-refreshes every 5 seconds
- Game state updates are immediate (useRef) while rendering uses React state batching
- Animation interpolation separates game logic (discrete 150ms) from visual rendering (continuous 60fps)

## Common Debugging

### Game Not Responding to Keys
- Check GamePlay component's useEffect for keyboard listener
- Verify arrow keys aren't being intercepted by browser

### Tests Failing
- Run `npm test -- --run` for full output
- Check auth state cleanup in beforeEach hooks

### Canvas Rendering Issues
- Verify GRID_SIZE and CELL_SIZE are synced
- Check gameState is being updated in useEffect game loop

### Food Collision Not Working (Historical Fix)
- **Problem**: After implementing initial food collision, it stopped working after first 1-2 hits
- **Root Cause**: React state closure issue - game loop was using stale state due to batching
- **Solution**: Implemented dual-state pattern with useRef
  - Game logic reads/writes from `gameStateRef` (always current)
  - React rendering triggered from `gameState` (batched updates)
  - Keyboard input stored in `nextDirectionRef` (immediate updates)
- **Key Learning**: Don't rely on state in game loops; use refs for immediate access to current values
- If collision detection breaks again, check that game loop is reading from refs, not state closures

## File Locations Reference

- Game logic: `src/services/gameLogic.js`
- API service: `src/services/api.js`
- Main routing: `src/App.jsx`
- Auth state: `src/contexts/AuthContext.jsx`
- Gameplay: `src/components/GamePlay.jsx`
- Canvas rendering: `src/components/SnakeGameCanvas.jsx`
