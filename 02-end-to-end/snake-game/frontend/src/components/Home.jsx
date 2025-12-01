import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePlayGame = (mode) => {
    navigate(`/play/${mode}`);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Snake Game</h1>
        <div className="header-right">
          {user && <span className="username">👤 {user.username}</span>}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="menu-content">
        <div className="menu-section">
          <h2>Select Game Mode</h2>
          <div className="mode-buttons">
            <div className="mode-card">
              <h3>Walls Mode</h3>
              <p>Classic snake game with walls. Hit a wall and you lose!</p>
              <button
                onClick={() => handlePlayGame('walls')}
                className="btn-play"
              >
                Play Walls
              </button>
            </div>

            <div className="mode-card">
              <h3>Pass-Through Mode</h3>
              <p>Wrap around edges. Exit one side and enter the opposite.</p>
              <button
                onClick={() => handlePlayGame('pass-through')}
                className="btn-play"
              >
                Play Pass-Through
              </button>
            </div>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-buttons">
            <button onClick={() => navigate('/leaderboard')} className="btn-secondary">
              🏆 Leaderboard
            </button>
            <button onClick={() => navigate('/watch')} className="btn-secondary">
              👀 Watch Players
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
