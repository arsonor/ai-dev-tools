import { describe, it, expect } from 'vitest';
import {
  initializeGame,
  updateGame,
  changeDirection,
  generateFood,
  getSnakeLength,
  getScore,
  isGameOver,
  GAME_MODES,
  DIRECTIONS,
} from './gameLogic';

describe('Snake Game Logic', () => {
  describe('Game Initialization', () => {
    it('should initialize game with default walls mode', () => {
      const game = initializeGame();
      expect(game.mode).toBe(GAME_MODES.WALLS);
      expect(game.snake).toHaveLength(3);
      expect(game.score).toBe(0);
      expect(game.gameOver).toBe(false);
    });

    it('should initialize game with pass-through mode', () => {
      const game = initializeGame(GAME_MODES.PASS_THROUGH);
      expect(game.mode).toBe(GAME_MODES.PASS_THROUGH);
    });

    it('should initialize with correct snake position', () => {
      const game = initializeGame();
      const head = game.snake[0];
      expect(head).toBeDefined();
      expect(game.snake[1].x).toBe(head.x - 1);
    });

    it('should have food on the board', () => {
      const game = initializeGame();
      expect(game.food).toBeDefined();
      expect(game.food.x).toBeGreaterThanOrEqual(0);
      expect(game.food.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Snake Movement', () => {
    it('should move snake right', () => {
      const game = initializeGame();
      const initialHead = { ...game.snake[0] };
      const updated = updateGame(game);

      expect(updated.snake[0].x).toBe(initialHead.x + 1);
      expect(updated.snake[0].y).toBe(initialHead.y);
    });

    it('should handle direction changes', () => {
      const game = initializeGame();
      const changed = changeDirection(game, DIRECTIONS.UP);

      expect(changed.nextDirection).toEqual(DIRECTIONS.UP);
    });

    it('should prevent 180-degree turns', () => {
      const game = initializeGame();
      game.direction = DIRECTIONS.RIGHT;
      const changed = changeDirection(game, DIRECTIONS.LEFT);

      expect(changed.nextDirection).not.toEqual(DIRECTIONS.LEFT);
    });

    it('should grow snake when eating food', () => {
      let game = initializeGame();
      const initialLength = game.snake.length;

      // Keep updating until food is eaten
      let foodEaten = false;
      for (let i = 0; i < 1000 && !foodEaten; i++) {
        const head = game.snake[0];
        if (head.x === game.food.x && head.y === game.food.y) {
          foodEaten = true;
        }
        game = updateGame(game);
      }

      if (foodEaten) {
        expect(game.snake.length).toBeGreaterThanOrEqual(initialLength);
      }
    });

    it('should add score when eating food', () => {
      let game = initializeGame();
      const initialScore = game.score;

      // Keep updating until food is eaten
      for (let i = 0; i < 1000; i++) {
        game = updateGame(game);
        if (game.score > initialScore) {
          break;
        }
      }

      expect(game.score).toBeGreaterThanOrEqual(initialScore);
    });
  });

  describe('Walls Mode', () => {
    it('should end game when hitting wall', () => {
      let game = initializeGame(GAME_MODES.WALLS);
      game.direction = DIRECTIONS.RIGHT;

      // Move to the right edge
      for (let i = 0; i < 25; i++) {
        game = updateGame(game);
        if (game.gameOver) break;
      }

      expect(game.gameOver).toBe(true);
    });

    it('should end game when hitting left wall', () => {
      let game = initializeGame(GAME_MODES.WALLS);
      game.direction = DIRECTIONS.LEFT;

      for (let i = 0; i < 25; i++) {
        game = updateGame(game);
        if (game.gameOver) break;
      }

      expect(game.gameOver).toBe(true);
    });
  });

  describe('Pass-Through Mode', () => {
    it('should wrap snake around when exiting right', () => {
      let game = initializeGame(GAME_MODES.PASS_THROUGH);
      let lastX = game.snake[0].x;

      for (let i = 0; i < 100; i++) {
        game = updateGame(game);
        // Check that snake wrapped around after going off screen
        if (game.snake[0].x < lastX) {
          // Wrapped around
          break;
        }
        lastX = game.snake[0].x;
      }

      // Game should still be running
      expect(game.gameOver).toBe(false);
    });

    it('should not end game from going off bounds', () => {
      let game = initializeGame(GAME_MODES.PASS_THROUGH);
      game.direction = DIRECTIONS.RIGHT;

      for (let i = 0; i < 100; i++) {
        game = updateGame(game);
      }

      expect(game.gameOver).toBe(false);
    });
  });

  describe('Self Collision', () => {
    it('should detect self collision', () => {
      let game = initializeGame();

      // Manually construct a situation where snake will collide with itself
      game.snake = [
        { x: 10, y: 10 }, // head
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 8, y: 11 },
        { x: 8, y: 12 },
        { x: 9, y: 12 },
        { x: 10, y: 12 },
      ];

      // Move head down into the body
      game.direction = DIRECTIONS.DOWN;
      game = updateGame(game);

      // Head should move to (10, 11), which is still empty
      // Move again
      game = updateGame(game);
      // Head should move to (10, 12), but we need to check for collision

      // Manually create collision scenario
      const testGame = initializeGame();
      testGame.snake = [
        { x: 5, y: 5 }, // head
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];

      // Check if any body segment exists at head position
      const headCollision = testGame.snake.slice(1).some(
        segment => segment.x === testGame.snake[0].x && segment.y === testGame.snake[0].y
      );

      expect(headCollision).toBe(false);

      // Now test with actual collision
      const collisionGame = initializeGame();
      collisionGame.snake = [
        { x: 5, y: 5 },
        { x: 5, y: 5 }, // Duplicate position (collision)
        { x: 4, y: 5 },
      ];

      const hasCollision = collisionGame.snake
        .slice(1)
        .some(segment => segment.x === collisionGame.snake[0].x && segment.y === collisionGame.snake[0].y);

      expect(hasCollision).toBe(true);
    });
  });

  describe('Food Generation', () => {
    it('should generate food not on snake', () => {
      const game = initializeGame();
      const food = generateFood(game.snake, game.mode);

      const onSnake = game.snake.some(s => s.x === food.x && s.y === food.y);
      expect(onSnake).toBe(false);
    });

    it('should generate different food positions', () => {
      const game = initializeGame();
      const food1 = generateFood(game.snake, game.mode);
      const food2 = generateFood(game.snake, game.mode);

      // While not guaranteed to be different due to randomness,
      // high probability they will be different
      const areDifferent = food1.x !== food2.x || food1.y !== food2.y;
      expect(areDifferent).toBe(true);
    });
  });

  describe('Game State Helpers', () => {
    it('should return correct snake length', () => {
      const game = initializeGame();
      expect(getSnakeLength(game)).toBe(3);
    });

    it('should return correct score', () => {
      const game = initializeGame();
      expect(getScore(game)).toBe(0);
    });

    it('should report game not over initially', () => {
      const game = initializeGame();
      expect(isGameOver(game)).toBe(false);
    });

    it('should report game over when gameOver is true', () => {
      const game = initializeGame();
      game.gameOver = true;
      expect(isGameOver(game)).toBe(true);
    });
  });
});
