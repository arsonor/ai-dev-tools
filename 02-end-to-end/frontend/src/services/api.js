/**
 * Centralized API service for all backend calls
 * This file mocks the backend API for now
 */

// Mock user data
const mockUsers = {
  user1: { id: 'user1', username: 'player1', highScore: 450 },
  user2: { id: 'user2', username: 'player2', highScore: 320 },
  user3: { id: 'user3', username: 'player3', highScore: 280 },
  user4: { id: 'user4', username: 'player4', highScore: 150 },
};

// Mock game sessions for watching
const mockGameSessions = {
  player2: {
    userId: 'user2',
    username: 'player2',
    gameMode: 'walls',
    score: 120,
    snakeLength: 8,
    isLive: true,
  },
  player3: {
    userId: 'user3',
    username: 'player3',
    gameMode: 'pass-through',
    score: 85,
    snakeLength: 5,
    isLive: true,
  },
};

let currentUser = null;
let currentGameSession = null;

/**
 * Authentication API
 */
export const authAPI = {
  login: async (username, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = Object.values(mockUsers).find(u => u.username === username);
    if (user && password === 'password') {
      currentUser = user;
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  signup: async (username, password) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const exists = Object.values(mockUsers).find(u => u.username === username);
    if (exists) {
      return { success: false, error: 'Username already exists' };
    }

    const newUser = {
      id: `user${Date.now()}`,
      username,
      highScore: 0,
    };
    mockUsers[newUser.id] = newUser;
    currentUser = newUser;
    return { success: true, user: newUser };
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    currentUser = null;
    currentGameSession = null;
    return { success: true };
  },

  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return currentUser;
  },
};

/**
 * Leaderboard API
 */
export const leaderboardAPI = {
  getLeaderboard: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return Object.values(mockUsers)
      .sort((a, b) => b.highScore - a.highScore)
      .map((user, index) => ({
        rank: index + 1,
        ...user,
      }));
  },

  updateScore: async (userId, newScore) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (mockUsers[userId]) {
      if (newScore > mockUsers[userId].highScore) {
        mockUsers[userId].highScore = newScore;
      }
      return { success: true, score: mockUsers[userId].highScore };
    }
    return { success: false, error: 'User not found' };
  },
};

/**
 * Game API
 */
export const gameAPI = {
  startGame: async (gameMode) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!currentUser) {
      return { success: false, error: 'Not logged in' };
    }

    currentGameSession = {
      userId: currentUser.id,
      username: currentUser.username,
      gameMode,
      score: 0,
      snakeLength: 3,
      startTime: Date.now(),
      isLive: true,
    };

    return { success: true, session: currentGameSession };
  },

  endGame: async (score, snakeLength) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!currentUser) {
      return { success: false, error: 'Not logged in' };
    }

    if (score > currentUser.highScore) {
      currentUser.highScore = score;
      mockUsers[currentUser.id].highScore = score;
    }

    currentGameSession = null;
    return { success: true, highScore: currentUser.highScore };
  },
};

/**
 * Watch/Spectate API
 */
export const watchAPI = {
  getActivePlayers: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return Object.values(mockGameSessions).map(session => ({
      ...session,
      timestamp: Date.now(),
    }));
  },

  watchPlayer: async (userId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const session = Object.values(mockGameSessions).find(s => s.userId === userId);
    if (session) {
      return { success: true, session };
    }
    return { success: false, error: 'Player not found or not playing' };
  },

  getPlayerUpdates: async (userId) => {
    // Simulate live updates with mock player movements
    await new Promise(resolve => setTimeout(resolve, 100));

    const session = Object.values(mockGameSessions).find(s => s.userId === userId);
    if (session) {
      // Simulate score and snake length changes
      const scoreIncrease = Math.floor(Math.random() * 5);
      const foodEaten = Math.random() > 0.7;

      return {
        success: true,
        score: session.score + scoreIncrease,
        snakeLength: session.snakeLength + (foodEaten ? 1 : 0),
        isLive: true,
      };
    }
    return { success: false, error: 'Session not found' };
  },
};

export default {
  authAPI,
  leaderboardAPI,
  gameAPI,
  watchAPI,
};
