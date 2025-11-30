import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchAPI } from '../services/api';
import SnakeGameCanvas from './SnakeGameCanvas';
import { initializeGame, updateGame, DIRECTIONS } from '../services/gameLogic';
import '../styles/Watch.css';

const Watch = () => {
  const [activePlayers, setActivePlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [watchingGameState, setWatchingGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const gameLoopRef = useRef(null);
  const updateIntervalRef = useRef(null);

  // Fetch active players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const players = await watchAPI.getActivePlayers();
        setActivePlayers(players);
      } catch (err) {
        setError('Failed to load active players');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();

    // Refresh players every 10 seconds
    const interval = setInterval(fetchPlayers, 10000);
    return () => clearInterval(interval);
  }, []);

  // Watch selected player
  useEffect(() => {
    if (!selectedPlayer) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      setWatchingGameState(null);
      return;
    }

    const startWatching = async () => {
      try {
        const result = await watchAPI.watchPlayer(selectedPlayer.userId);
        if (result.success) {
          // Initialize a mock game state for the watched player
          const initialState = {
            mode: selectedPlayer.gameMode,
            score: selectedPlayer.score,
            snake: generateMockSnake(selectedPlayer.snakeLength),
            direction: DIRECTIONS.RIGHT,
            nextDirection: DIRECTIONS.RIGHT,
            food: { x: 10, y: 10 },
            gameOver: false,
            gameStarted: true,
            foodEaten: 0,
          };
          setWatchingGameState(initialState);
        }
      } catch (err) {
        console.error('Error watching player:', err);
      }
    };

    startWatching();
  }, [selectedPlayer]);

  // Simulate watched player's movements
  useEffect(() => {
    if (!watchingGameState || !selectedPlayer) return;

    // Simulate game updates
    gameLoopRef.current = setInterval(() => {
      setWatchingGameState((prevState) => {
        const newState = updateGame(prevState);
        return newState;
      });
    }, 200);

    // Get real player updates from API
    updateIntervalRef.current = setInterval(async () => {
      try {
        const updates = await watchAPI.getPlayerUpdates(selectedPlayer.userId);
        if (updates.success) {
          setWatchingGameState((prevState) => ({
            ...prevState,
            score: updates.score,
            foodEaten: Math.floor(updates.snakeLength - 3),
          }));
        }
      } catch (err) {
        console.error('Error getting player updates:', err);
      }
    }, 2000);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, [watchingGameState, selectedPlayer]);

  const handleBackToMenu = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    navigate('/');
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
  };

  if (loading && activePlayers.length === 0) {
    return (
      <div className="watch-container">
        <div className="watch-header">
          <h1>👀 Watch Players</h1>
          <button onClick={handleBackToMenu} className="btn-secondary">
            Back to Menu
          </button>
        </div>
        <div className="loading">Loading active players...</div>
      </div>
    );
  }

  return (
    <div className="watch-container">
      <div className="watch-header">
        <h1>👀 Watch Players</h1>
        <button onClick={handleBackToMenu} className="btn-secondary">
          Back to Menu
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="watch-content">
        <div className="players-list">
          <h2>Active Players ({activePlayers.length})</h2>
          {activePlayers.length === 0 ? (
            <p className="no-players">No active players at the moment.</p>
          ) : (
            <div className="player-cards">
              {activePlayers.map((player) => (
                <div
                  key={player.userId}
                  className={`player-card ${selectedPlayer?.userId === player.userId ? 'selected' : ''}`}
                  onClick={() => handleSelectPlayer(player)}
                >
                  <div className="player-header">
                    <h3>{player.username}</h3>
                    <span className="live-indicator">● LIVE</span>
                  </div>
                  <div className="player-info">
                    <p>Mode: {player.gameMode}</p>
                    <p>Score: {player.score}</p>
                    <p>Snake Length: {player.snakeLength}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPlayer && watchingGameState && (
          <div className="watching-section">
            <h2>Watching: {selectedPlayer.username}</h2>
            <div className="game-canvas-wrapper">
              <SnakeGameCanvas gameState={watchingGameState} isSpectating={true} />
            </div>
            <div className="watch-stats">
              <div className="stat">
                <span className="stat-label">Score:</span>
                <span className="stat-value">{watchingGameState.score}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Snake Length:</span>
                <span className="stat-value">{watchingGameState.snake.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Mode:</span>
                <span className="stat-value">{watchingGameState.mode}</span>
              </div>
            </div>
          </div>
        )}

        {!selectedPlayer && (
          <div className="no-selection">
            <p>Select a player to watch their game</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to generate a mock snake
function generateMockSnake(length) {
  const snake = [];
  for (let i = 0; i < length; i++) {
    snake.push({ x: 10 - i, y: 10 });
  }
  return snake;
}

export default Watch;
