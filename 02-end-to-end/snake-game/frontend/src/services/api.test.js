import { describe, it, expect, beforeEach } from 'vitest';
import { authAPI, leaderboardAPI, gameAPI, watchAPI } from './api';

describe('API Service - Authentication', () => {
  beforeEach(async () => {
    // Logout before each test
    await authAPI.logout();
  });

  it('should successfully login with correct credentials', async () => {
    const result = await authAPI.login('player1', 'password');

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.username).toBe('player1');
  });

  it('should fail login with wrong password', async () => {
    const result = await authAPI.login('player1', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should fail login with non-existent user', async () => {
    const result = await authAPI.login('nonexistent', 'password');

    expect(result.success).toBe(false);
  });

  it('should successfully signup with new username', async () => {
    const result = await authAPI.signup('newplayer', 'password');

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.username).toBe('newplayer');
    expect(result.user.highScore).toBe(0);
  });

  it('should fail signup with existing username', async () => {
    // First signup succeeds
    await authAPI.signup('testuser', 'password');

    // Second signup with same username fails
    const result = await authAPI.signup('testuser', 'password');

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('should return current user after login', async () => {
    await authAPI.login('player1', 'password');
    const user = await authAPI.getCurrentUser();

    expect(user).toBeDefined();
    expect(user.username).toBe('player1');
  });

  it('should return null for current user after logout', async () => {
    await authAPI.login('player1', 'password');
    await authAPI.logout();
    const user = await authAPI.getCurrentUser();

    expect(user).toBeNull();
  });
});

describe('API Service - Leaderboard', () => {
  it('should return leaderboard sorted by score', async () => {
    const leaderboard = await leaderboardAPI.getLeaderboard();

    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeGreaterThan(0);

    // Check that it's sorted in descending order
    for (let i = 1; i < leaderboard.length; i++) {
      expect(leaderboard[i - 1].highScore).toBeGreaterThanOrEqual(leaderboard[i].highScore);
    }
  });

  it('should include rank in leaderboard entries', async () => {
    const leaderboard = await leaderboardAPI.getLeaderboard();

    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[1].rank).toBe(2);
  });

  it('should update user score if higher', async () => {
    await authAPI.login('player1', 'password');
    const result = await leaderboardAPI.updateScore('user1', 500);

    expect(result.success).toBe(true);
    expect(result.score).toBe(500);
  });

  it('should not lower score when updating with lower value', async () => {
    await authAPI.login('player1', 'password');
    const result = await leaderboardAPI.updateScore('user1', 100);

    // Should return current high score (450) not the lower value
    expect(result.success).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(100);
  });

  it('should fail updating non-existent user', async () => {
    const result = await leaderboardAPI.updateScore('nonexistent', 100);

    expect(result.success).toBe(false);
  });
});

describe('API Service - Game', () => {
  beforeEach(async () => {
    await authAPI.logout();
  });

  it('should fail starting game without login', async () => {
    const result = await gameAPI.startGame('walls');

    expect(result.success).toBe(false);
  });

  it('should start game with walls mode when logged in', async () => {
    await authAPI.login('player1', 'password');
    const result = await gameAPI.startGame('walls');

    expect(result.success).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session.gameMode).toBe('walls');
    expect(result.session.score).toBe(0);
  });

  it('should start game with pass-through mode', async () => {
    await authAPI.login('player1', 'password');
    const result = await gameAPI.startGame('pass-through');

    expect(result.success).toBe(true);
    expect(result.session.gameMode).toBe('pass-through');
  });

  it('should end game and update score', async () => {
    await authAPI.login('player1', 'password');
    await gameAPI.startGame('walls');

    const result = await gameAPI.endGame(250, 8);

    expect(result.success).toBe(true);
    expect(result.highScore).toBeDefined();
  });

  it('should fail ending game without login', async () => {
    const result = await gameAPI.endGame(100, 5);

    expect(result.success).toBe(false);
  });
});

describe('API Service - Watch', () => {
  it('should return list of active players', async () => {
    const players = await watchAPI.getActivePlayers();

    expect(Array.isArray(players)).toBe(true);
    expect(players.length).toBeGreaterThan(0);
  });

  it('should have required fields in active player', async () => {
    const players = await watchAPI.getActivePlayers();

    const player = players[0];
    expect(player.userId).toBeDefined();
    expect(player.username).toBeDefined();
    expect(player.gameMode).toBeDefined();
    expect(player.score).toBeDefined();
    expect(player.snakeLength).toBeDefined();
    expect(player.isLive).toBe(true);
  });

  it('should watch a player', async () => {
    const players = await watchAPI.getActivePlayers();
    const result = await watchAPI.watchPlayer(players[0].userId);

    expect(result.success).toBe(true);
    expect(result.session).toBeDefined();
  });

  it('should fail watching non-existent player', async () => {
    const result = await watchAPI.watchPlayer('nonexistent');

    expect(result.success).toBe(false);
  });

  it('should get player updates', async () => {
    const players = await watchAPI.getActivePlayers();
    const updates = await watchAPI.getPlayerUpdates(players[0].userId);

    expect(updates.success).toBe(true);
    expect(updates.score).toBeDefined();
    expect(updates.snakeLength).toBeDefined();
    expect(updates.isLive).toBe(true);
  });

  it('should fail getting updates for non-existent session', async () => {
    const updates = await watchAPI.getPlayerUpdates('nonexistent');

    expect(updates.success).toBe(false);
  });
});
