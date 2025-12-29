import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SnakeGameCanvas from './SnakeGameCanvas';
import {
  initializeGame,
  updateGame,
  changeDirection,
  DIRECTIONS,
  getSnakeLength,
  getScore,
  GRID_SIZE,
} from '../services/gameLogic';
import { gameAPI } from '../services/api';
import '../styles/Game.css';

const GAME_SPEED = 150; // milliseconds between moves - ~6.7 moves per second
const POINTS_PER_SEGMENT = 5; // Interpolation points per snake segment

const GamePlay = ({ gameMode }) => {
  // Use ref to track game state for immediate access
  const gameStateRef = useRef(initializeGame(gameMode));
  const [gameState, setGameState] = useState(initializeGame(gameMode));
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const gameLoopRef = useRef(null);
  const nextDirectionRef = useRef(DIRECTIONS.RIGHT);
  const navigate = useNavigate();

  // Initialize trail from snake positions
  const initTrail = (snake) => {
    const newTrail = [];
    // Create initial trail from snake segments
    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      // Add multiple points per segment
      for (let j = 0; j < POINTS_PER_SEGMENT; j++) {
        newTrail.push({ x: seg.x, y: seg.y });
      }
    }
    return newTrail;
  };

  // Trail for smooth snake movement - stores path the head has traveled
  const initialTrailValue = initTrail(gameStateRef.current.snake);
  const trailRef = useRef(initialTrailValue);
  const [trail, setTrail] = useState(initialTrailValue);
  const [tickTime, setTickTime] = useState(Date.now());

  // Start game with spacebar
  const handleStartGame = async () => {
    const initialState = initializeGame(gameMode);
    gameStateRef.current = initialState;
    nextDirectionRef.current = DIRECTIONS.RIGHT;
    const initialTrail = initTrail(initialState.snake);
    trailRef.current = initialTrail;
    setTrail(initialTrail);
    setGameState(initialState);
    setTickTime(Date.now());
    setFinalScore(0);
    setIsPlaying(true);
  };

  // Simple game loop with ref for immediate collision detection
  useEffect(() => {
    if (!isPlaying) return;

    gameLoopRef.current = setInterval(() => {
      // Get current state from ref
      let current = gameStateRef.current;

      // Stop if already game over
      if (current.gameOver) {
        setIsPlaying(false);
        return;
      }

      // Store previous head position
      const prevHead = { ...current.snake[0] };

      // Apply pending direction change
      current = {
        ...current,
        direction: nextDirectionRef.current,
        nextDirection: nextDirectionRef.current,
      };

      // Update game
      current = updateGame(current);

      // Get new head position
      const newHead = current.snake[0];

      // Calculate if this was a wrap-around
      const dx = newHead.x - prevHead.x;
      const dy = newHead.y - prevHead.y;
      const wrapped = Math.abs(dx) > 1 || Math.abs(dy) > 1;

      // Add interpolated points to trail (from newHead backwards to prevHead)
      const newPoints = [];
      if (wrapped) {
        // For wrap-around, just add the new position directly
        for (let i = 0; i < POINTS_PER_SEGMENT; i++) {
          newPoints.push({ x: newHead.x, y: newHead.y });
        }
      } else {
        // Interpolate from new head back towards previous (index 0 = newHead)
        for (let i = 0; i < POINTS_PER_SEGMENT; i++) {
          const t = i / POINTS_PER_SEGMENT; // 0, 0.2, 0.4, 0.6, 0.8
          newPoints.push({
            x: newHead.x - (newHead.x - prevHead.x) * t,
            y: newHead.y - (newHead.y - prevHead.y) * t
          });
        }
      }

      // Update trail: add new points at front, trim from end
      const maxTrailLength = (current.snake.length + 1) * POINTS_PER_SEGMENT;
      const updatedTrail = [...newPoints, ...trailRef.current].slice(0, maxTrailLength);
      trailRef.current = updatedTrail;

      // Update ref and state for rendering
      gameStateRef.current = current;
      setTrail(updatedTrail);
      setTickTime(Date.now());
      setGameState(current);

      // If game just ended
      if (current.gameOver) {
        gameAPI.endGame(current.score, current.snake.length);
      }
    }, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying]);

  // Handle game over
  useEffect(() => {
    if (gameState.gameOver && isPlaying) {
      setIsPlaying(false);
      setFinalScore(gameState.score);
    }
  }, [gameState.gameOver, isPlaying]);

  // Spacebar to start game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isPlaying && !gameState.gameOver) {
        e.preventDefault();
        handleStartGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameState.gameOver]);

  // Arrow keys to control snake
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          nextDirectionRef.current = DIRECTIONS.UP;
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextDirectionRef.current = DIRECTIONS.DOWN;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextDirectionRef.current = DIRECTIONS.LEFT;
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextDirectionRef.current = DIRECTIONS.RIGHT;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const handlePlayAgain = () => {
    const initialState = initializeGame(gameMode);
    gameStateRef.current = initialState;
    nextDirectionRef.current = DIRECTIONS.RIGHT;
    const initialTrail = initTrail(initialState.snake);
    trailRef.current = initialTrail;
    setTrail(initialTrail);
    setGameState(initialState);
    setTickTime(Date.now());
    setFinalScore(0);
    setIsPlaying(true);
  };

  const handleBackToMenu = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    navigate('/');
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <h1>Snake Game</h1>
          <p className="mode-indicator">Mode: {gameMode}</p>
        </div>
        <button onClick={handleBackToMenu} className="btn-secondary">
          Back to Menu
        </button>
      </div>

      <div className="game-content">
        <div className="game-canvas-wrapper">
          <SnakeGameCanvas
            gameState={gameState}
            trail={trail}
            tickTime={tickTime}
            gameSpeed={GAME_SPEED}
          />
        </div>

        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{gameState.score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Length</span>
            <span className="stat-value">{gameState.snake.length}</span>
          </div>
          {finalScore > 0 && (
            <div className="stat">
              <span className="stat-label">Final Score</span>
              <span className="stat-value">{finalScore}</span>
            </div>
          )}
        </div>
      </div>

      <div className="game-controls">
        {!isPlaying && !gameState.gameOver && (
          <div className="start-section">
            <p className="spacebar-instruction">Press SPACE to start</p>
          </div>
        )}

        {isPlaying && !gameState.gameOver && (
          <div className="keyboard-instructions">
            <p>Use arrow keys to control the snake</p>
          </div>
        )}

        {gameState.gameOver && (
          <div className="game-over-section">
            <h2>Game Over!</h2>
            <p className="final-score-text">Final Score: {finalScore}</p>
            <div className="game-over-buttons">
              <button onClick={handlePlayAgain} className="btn-primary">
                Play Again
              </button>
              <button onClick={handleBackToMenu} className="btn-secondary">
                Main Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlay;
