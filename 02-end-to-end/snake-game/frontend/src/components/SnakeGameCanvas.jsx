import React, { useEffect, useRef } from 'react';
import { GRID_SIZE } from '../services/gameLogic';

const CELL_SIZE = 20;

const SnakeGameCanvas = ({ gameState, isSpectating = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = GRID_SIZE * CELL_SIZE;
    const height = GRID_SIZE * CELL_SIZE;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid - make it more visible
    ctx.strokeStyle = '#2d3561';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    const food = gameState.food;
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
      food.x * CELL_SIZE + 2,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    // Draw snake
    const snake = gameState.snake;
    snake.forEach((segment, index) => {
      // Head color
      if (index === 0) {
        ctx.fillStyle = '#2ecc71';
      } else {
        // Body with gradient effect
        const opacity = 1 - (index / snake.length) * 0.3;
        ctx.fillStyle = `rgba(46, 204, 113, ${opacity})`;
      }

      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Don't draw score/mode on canvas - display in sidebar instead
  }, [gameState, isSpectating]);

  const canvasHeight = GRID_SIZE * CELL_SIZE;

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE * CELL_SIZE}
      height={canvasHeight}
      className="snake-canvas"
      style={{
        border: '2px solid #ecf0f1',
        borderRadius: '4px',
        display: 'block',
      }}
    />
  );
};

export default SnakeGameCanvas;
