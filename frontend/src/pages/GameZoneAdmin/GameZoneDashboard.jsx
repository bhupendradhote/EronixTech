import React from 'react';
import { FiUsers, FiActivity, FiDollarSign, FiPlay, FiSettings, FiEdit3 } from 'react-icons/fi';
import './GameZoneDashboard.css';

const GameZoneDashboard = () => {
  // Mock data for the dashboard
  const stats = [
    { id: 1, title: 'Active Players', value: '1,245', icon: <FiUsers />, color: 'purple' },
    { id: 2, title: 'Server Status', value: '99.8% Uptime', icon: <FiActivity />, color: 'green' },
    { id: 3, title: 'Daily Revenue', value: '$4,820', icon: <FiDollarSign />, color: 'pink' },
  ];

  const games = [
    { id: 1, title: 'Cyber Strike', players: 432, status: 'Online', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80' },
    { id: 2, title: 'Neon Racing', players: 215, status: 'Online', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80' },
    { id: 3, title: 'Fantasy Quest', players: 0, status: 'Maintenance', image: 'https://images.unsplash.com/photo-1538481199005-c710c4e965fc?auto=format&fit=crop&w=300&q=80' },
    { id: 4, title: 'Galactic War', players: 598, status: 'Online', image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=300&q=80' },
  ];

  return (
    <div className="game-zone-container">
      {/* Header Section */}
      <div className="gz-header">
        <div>
          <h1 className="gz-title">Game Zone Admin</h1>
          <p className="gz-subtitle">Manage games, monitor servers, and track player activity.</p>
        </div>
        <button className="gz-btn-primary">
          <FiSettings /> Zone Settings
        </button>
      </div>

      {/* Stats Overview */}
      <div className="gz-stats-grid">
        {stats.map(stat => (
          <div className={`gz-stat-card glow-${stat.color}`} key={stat.id}>
            <div className={`gz-stat-icon text-${stat.color}`}>
              {stat.icon}
            </div>
            <div className="gz-stat-info">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Games Management Section */}
      <div className="gz-section-header">
        <h2>Active Game Servers</h2>
      </div>

      <div className="gz-games-grid">
        {games.map(game => (
          <div className="gz-game-card" key={game.id}>
            <div className="gz-game-img-wrapper">
              <img src={game.image} alt={game.title} />
              <div className={`gz-status-badge ${game.status === 'Online' ? 'status-online' : 'status-offline'}`}>
                {game.status}
              </div>
            </div>
            <div className="gz-game-content">
              <h3>{game.title}</h3>
              <div className="gz-game-meta">
                <span><FiUsers /> {game.players} playing</span>
              </div>
              <div className="gz-game-actions">
                <button className="gz-btn-icon play" title="Launch Server"><FiPlay /></button>
                <button className="gz-btn-icon edit" title="Edit Game"><FiEdit3 /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameZoneDashboard;