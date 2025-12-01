/**
 * Snake Game Logic
 * Supports two models: 'pass-through' and 'walls'
 */

export const GAME_MODES = {
  PASS_THROUGH: 'pass-through',
  WALLS: 'walls',
};

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const GRID_SIZE = 20;
const CELL_SIZE = 20;

/**
 * Initialize a new game state
 */
export const initializeGame = (mode = GAME_MODES.WALLS) => {
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);

  const initialSnake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];

  return {
    mode,
    score: 0,
    snake: initialSnake,
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    food: generateFood(initialSnake, mode),
    gameOver: false,
    gameStarted: false,
    foodEaten: 0,
  };
};

/**
 * Generate a random food position
 */
export const generateFood = (snake, mode) => {
  let newFood;
  let isValid = false;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loops

  while (!isValid && attempts < maxAttempts) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };

    // Check if position is not on snake
    isValid = !snake.some(segment =>
      segment && segment.x === newFood.x && segment.y === newFood.y
    );

    attempts++;
  }

  // If we couldn't find a valid position (shouldn't happen), return a safe position
  if (!isValid) {
    return { x: 0, y: 0 };
  }

  return newFood;
};

/**
 * Check if a position is within bounds (for walls mode)
 */
const isWithinBounds = (x, y) => {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
};

/**
 * Apply wrapping for pass-through mode
 */
const wrapCoordinate = (value) => {
  return ((value % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
};

/**
 * Update game state for one tick
 */
export const updateGame = (gameState) => {
  if (gameState.gameOver) {
    return gameState;
  }

  const newState = { ...gameState };
  newState.direction = newState.nextDirection;

  // Calculate new head position
  const head = newState.snake[0];
  let newHead = {
    x: head.x + newState.direction.x,
    y: head.y + newState.direction.y,
  };

  // Apply game mode rules
  if (gameState.mode === GAME_MODES.PASS_THROUGH) {
    // Wrap around edges
    newHead.x = wrapCoordinate(newHead.x);
    newHead.y = wrapCoordinate(newHead.y);
  } else if (gameState.mode === GAME_MODES.WALLS) {
    // Check wall collision
    if (!isWithinBounds(newHead.x, newHead.y)) {
      newState.gameOver = true;
      return newState;
    }
  }

  // Check self collision
  if (newState.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    newState.gameOver = true;
    return newState;
  }

  // Add new head
  newState.snake.unshift(newHead);

  // Check food collision
  if (newHead.x === newState.food.x && newHead.y === newState.food.y) {
    newState.score += 10;
    newState.foodEaten += 1;
    // Generate new food after snake grows (including new head)
    newState.food = generateFood(newState.snake, newState.mode);
  } else {
    // Remove tail if no food eaten
    newState.snake.pop();
  }

  return newState;
};

/**
 * Change snake direction (prevents 180-degree turns)
 */
export const changeDirection = (gameState, newDirection) => {
  const isOpposite =
    (gameState.direction.x === -newDirection.x && gameState.direction.y === -newDirection.y);

  if (!isOpposite) {
    return { ...gameState, nextDirection: newDirection };
  }

  return gameState;
};

/**
 * Get the snake length
 */
export const getSnakeLength = (gameState) => {
  return gameState.snake.length;
};

/**
 * Get the score
 */
export const getScore = (gameState) => {
  return gameState.score;
};

/**
 * Check if game is over
 */
export const isGameOver = (gameState) => {
  return gameState.gameOver;
};
