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
} from '../services/gameLogic';
import { gameAPI } from '../services/api';
import '../styles/Game.css';

const GAME_SPEED = 500; // milliseconds between moves - 2 moves per second

const GamePlay = ({ gameMode }) => {
  // Use ref to track game state for immediate access
  const gameStateRef = useRef(initializeGame(gameMode));
  const [gameState, setGameState] = useState(initializeGame(gameMode));
  const [isPlaying, setIsPlaying] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const gameLoopRef = useRef(null);
  const nextDirectionRef = useRef(DIRECTIONS.RIGHT);
  const navigate = useNavigate();

  // Start game with spacebar
  const handleStartGame = async () => {
    const initialState = initializeGame(gameMode);
    gameStateRef.current = initialState;
    nextDirectionRef.current = DIRECTIONS.RIGHT;
    setGameState(initialState);
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

      // Apply pending direction change
      current = {
        ...current,
        direction: nextDirectionRef.current,
        nextDirection: nextDirectionRef.current,
      };

      // Update game
      current = updateGame(current);

      // Update ref and state for rendering
      gameStateRef.current = current;
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
    setGameState(initialState);
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
          <SnakeGameCanvas gameState={gameState} />
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
