import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await leaderboardAPI.getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        setError('Failed to load leaderboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Refresh leaderboard every 5 seconds
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBackToMenu = () => {
    navigate('/');
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="leaderboard-container">
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <button onClick={handleBackToMenu} className="btn-secondary">
          Back to Menu
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="leaderboard-content">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              {user && <th className="you-column">You</th>}
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.id} className={user?.id === entry.id ? 'current-user' : ''}>
                <td className="rank">
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                  {entry.rank > 3 && entry.rank}
                </td>
                <td className="player">{entry.username}</td>
                <td className="score">{entry.highScore}</td>
                {user && (
                  <td className="you-column">
                    {user.id === entry.id && '✓'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user && (
        <div className="user-rank-info">
          <p>Your username: <strong>{user.username}</strong></p>
          <p>Your high score: <strong>{user.highScore}</strong></p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
