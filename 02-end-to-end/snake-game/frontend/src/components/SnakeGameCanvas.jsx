import React, { useEffect, useRef } from 'react';
import { GRID_SIZE } from '../services/gameLogic';

const CELL_SIZE = 20;

const SnakeGameCanvas = ({
  gameState,
  trail = [],
  tickTime = 0,
  gameSpeed = 150,
  isSpectating = false
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dataRef = useRef({ gameState, trail, tickTime, gameSpeed });

  dataRef.current = { gameState, trail, tickTime, gameSpeed };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    const width = GRID_SIZE * CELL_SIZE;
    const height = GRID_SIZE * CELL_SIZE;

    // Pre-render static grid
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = width;
    gridCanvas.height = height;
    const gridCtx = gridCanvas.getContext('2d');

    gridCtx.fillStyle = '#1a1a2e';
    gridCtx.fillRect(0, 0, width, height);
    gridCtx.strokeStyle = '#2d3561';
    gridCtx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      gridCtx.beginPath();
      gridCtx.moveTo(i * CELL_SIZE, 0);
      gridCtx.lineTo(i * CELL_SIZE, height);
      gridCtx.stroke();
      gridCtx.beginPath();
      gridCtx.moveTo(0, i * CELL_SIZE);
      gridCtx.lineTo(width, i * CELL_SIZE);
      gridCtx.stroke();
    }

    const render = () => {
      const { gameState: state, trail, tickTime, gameSpeed } = dataRef.current;

      const elapsed = Date.now() - tickTime;
      const progress = Math.min(elapsed / gameSpeed, 1);

      // Draw pre-rendered grid
      ctx.drawImage(gridCanvas, 0, 0);

      // Draw food
      const food = state.food;
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw snake using trail
      if (trail.length >= 1) {
        const snakeLength = state.snake.length;
        const pointsPerSegment = 5;
        const totalPoints = snakeLength * pointsPerSegment;
        const radius = CELL_SIZE / 2 - 2;

        // Use progress to smoothly offset into the trail
        // At progress=0, look at older points (index ~5, near prevHead)
        // At progress=1, look at newest points (index 0, newHead)
        const offset = (1 - progress) * (pointsPerSegment - 1);

        // Draw from tail to head
        for (let i = totalPoints - 1; i >= 0; i--) {
          // Calculate trail index with smooth offset (use fractional for interpolation)
          const exactIdx = i + offset;
          const trailIdx = Math.floor(exactIdx);
          const frac = exactIdx - trailIdx;

          if (trailIdx >= trail.length - 1 || trailIdx < 0) continue;

          const point = trail[trailIdx];
          const nextPoint = trail[trailIdx + 1];
          if (!point || !nextPoint) continue;

          // Check for wrap-around (points far apart = wrapped, don't interpolate)
          const dx = Math.abs(point.x - nextPoint.x);
          const dy = Math.abs(point.y - nextPoint.y);
          const wrapped = dx > 1 || dy > 1;

          let px, py;
          if (wrapped) {
            // Don't interpolate across wrap - just use current point
            px = point.x * CELL_SIZE + CELL_SIZE / 2;
            py = point.y * CELL_SIZE + CELL_SIZE / 2;
          } else {
            // Interpolate between trail points for extra smoothness
            px = (point.x + (nextPoint.x - point.x) * frac) * CELL_SIZE + CELL_SIZE / 2;
            py = (point.y + (nextPoint.y - point.y) * frac) * CELL_SIZE + CELL_SIZE / 2;
          }

          // Color gradient from head to tail
          const t = i / totalPoints;
          const brightness = 1 - t * 0.4;

          if (i < pointsPerSegment) {
            ctx.fillStyle = '#2ecc71';
          } else {
            ctx.fillStyle = `rgba(46, 204, 113, ${brightness})`;
          }

          // Slightly smaller radius for tail
          const r = radius * (1 - t * 0.15);

          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw eyes on head
        const headIdx = Math.floor(offset);
        const headFrac = offset - headIdx;
        const headPoint = trail[headIdx];
        const headNextPoint = trail[headIdx + 1];
        if (headPoint && headNextPoint) {
          const px = (headPoint.x + (headNextPoint.x - headPoint.x) * headFrac) * CELL_SIZE + CELL_SIZE / 2;
          const py = (headPoint.y + (headNextPoint.y - headPoint.y) * headFrac) * CELL_SIZE + CELL_SIZE / 2;

          const dir = state.direction || { x: 1, y: 0 };
          const angle = Math.atan2(dir.y, dir.x);

          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(
            px + Math.cos(angle) * 3 + Math.cos(angle + Math.PI/2) * 4,
            py + Math.sin(angle) * 3 + Math.sin(angle + Math.PI/2) * 4,
            2.5, 0, Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            px + Math.cos(angle) * 3 + Math.cos(angle - Math.PI/2) * 4,
            py + Math.sin(angle) * 3 + Math.sin(angle - Math.PI/2) * 4,
            2.5, 0, Math.PI * 2
          );
          ctx.fill();

          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(
            px + Math.cos(angle) * 4 + Math.cos(angle + Math.PI/2) * 4,
            py + Math.sin(angle) * 4 + Math.sin(angle + Math.PI/2) * 4,
            1.2, 0, Math.PI * 2
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            px + Math.cos(angle) * 4 + Math.cos(angle - Math.PI/2) * 4,
            py + Math.sin(angle) * 4 + Math.sin(angle - Math.PI/2) * 4,
            1.2, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
