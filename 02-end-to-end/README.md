# Multiplayer Snake Game

A full-stack snake game application with multiplayer features including leaderboards and spectating. The application is built with a React frontend and is designed to integrate with a Python backend.

## Features

### Core Game Features
- **Two Game Modes**:
  - **Walls Mode**: Classic snake gameplay where hitting walls ends the game
  - **Pass-Through Mode**: Wrap around edges - exit one side and enter the opposite
- **Real-time Score Tracking**: Points awarded for eating food
- **Snake Growth**: Snake grows when consuming food
- **Collision Detection**: Game ends on self-collision (walls mode) or wall collision

### Multiplayer Features
- **User Authentication**: Sign up and login system with persistent sessions
- **Leaderboard**: View top players ranked by high score
- **Spectating**: Watch other players' games in real-time with mock player data
- **Session Management**: Automatic game session creation and score updates

### UI/UX Features
- **Interactive Canvas**: Real-time game rendering with grid visualization
- **Responsive Design**: Works on desktop and tablet devices
- **Dark Theme**: Professional dark UI with gradient accents
- **Keyboard Controls**: Arrow keys to control the snake

## Project Structure

```
02-end-to-end/
├── frontend/                 # React-based frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API and game logic services
│   │   ├── styles/          # Component-specific stylesheets
│   │   ├── App.jsx         # Main app with routing
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── vitest.setup.js     # Test configuration
├── backend/                 # Python backend (structure ready)
│   ├── pyproject.toml      # Python project configuration
│   └── uv.lock             # UV dependency lock file
└── README.md               # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- npm or yarn (for frontend)
- Python 3.11+ (for backend)
- uv (for Python dependency management)

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Demo Credentials

For testing the application without creating new accounts:
- **Username**: `player1`
- **Password**: `password`

## API Architecture

The frontend uses a centralized API service layer (`src/services/api.js`) that abstracts all backend communication. This service is mocked for development and testing, making it easy to:

1. Switch to real backend endpoints later
2. Test the frontend independently
3. Develop features without backend readiness

### API Service Modules

- **authAPI**: User authentication (login, signup, logout)
- **leaderboardAPI**: Leaderboard data and score updates
- **gameAPI**: Game session management
- **watchAPI**: Spectating active players

## Game Logic

The game logic is encapsulated in `src/services/gameLogic.js` and includes:

- Game state initialization
- Snake movement and direction changes
- Collision detection (walls, self)
- Food generation and eating mechanics
- Score calculation

### Key Features
- Prevents 180-degree snake turns
- Handles wrapping for pass-through mode
- Efficient food placement (never on snake)
- Full game state immutability for React

## Testing

The project includes comprehensive test coverage with **48 passing tests**:

### Test Files
- **gameLogic.test.js** (20 tests): Snake movement, collisions, modes, food
- **api.test.js** (23 tests): Authentication, leaderboard, game, spectating
- **AuthContext.test.jsx** (5 tests): Authentication context and hooks

### Running Tests
```bash
npm test                    # Run all tests (watch mode)
npm test -- --run          # Run tests once
npm test -- --coverage     # Generate coverage report
```

## Components

### Authentication
- **Login**: User login with credentials
- **Signup**: New user registration

### Game
- **GamePlay**: Main game component with canvas rendering
- **SnakeGameCanvas**: Canvas-based game rendering

### Social Features
- **Leaderboard**: Top players display with auto-refresh
- **Watch**: Spectate active players with live updates

### Main Navigation
- **Home**: Game mode selection and feature access

## State Management

The application uses:
- **React Context** (AuthContext): Global authentication state
- **React Hooks** (useState, useEffect): Component-level state
- **Custom Hooks** (useAuth): Easy access to auth state

## Styling

All styles are modular and organized by feature:
- `Auth.css`: Login/Signup pages
- `Home.css`: Main menu and game selection
- `Game.css`: Gameplay interface
- `Leaderboard.css`: Leaderboard display
- `Watch.css`: Spectating interface
- `index.css`: Global styles and resets

Color Scheme:
- Primary: #667eea (Purple)
- Secondary: #764ba2 (Dark Purple)
- Success: #2ecc71 (Green)
- Dark Background: #1a1a2e
- Text: #ecf0f1 (Light Gray)

## Development Workflow

### Adding New Features
1. Create tests first (TDD approach)
2. Implement feature logic
3. Create/update UI components
4. Update API service if needed
5. Run full test suite

### Backend Integration
When ready to integrate with a real backend:
1. Update `src/services/api.js` endpoints
2. Remove mock data and delays
3. Handle real authentication tokens
4. Implement error handling for network issues

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- **Bundle Size**: ~78KB gzipped (with dependencies)
- **Game FPS**: 10 updates/second (100ms ticks)
- **Canvas Rendering**: Optimized for 20x20 grid

## Future Enhancements

- Real backend integration
- Persistent user profiles
- Game replays
- Achievements and badges
- Multiplayer competitive modes
- Mobile app version
- Sound effects and music
- Custom snake skins

## License

MIT

## Support

For issues or questions, please refer to the CLAUDE.md file for development guidance.
