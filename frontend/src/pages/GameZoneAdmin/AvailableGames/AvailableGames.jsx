import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi';
import gameService from '../../../services/gameService';
import GameFormModal from './GameFormModal';
import './AvailableGames.css';

const AvailableGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [error, setError] = useState('');

  // Fetch games on mount
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const data = await gameService.getAllGames();
      setGames(data.games || []);
    } catch (err) {
      setError('Failed to load games');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter games by search term
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open modal for create
  const handleCreate = () => {
    setEditingGame(null);
    setModalOpen(true);
  };

  // Open modal for edit
  const handleEdit = (game) => {
    setEditingGame(game);
    setModalOpen(true);
  };

  // Handle delete (soft delete)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this game?')) return;
    try {
      await gameService.deleteGame(id);
      await fetchGames(); // refresh list
    } catch (err) {
      alert('Failed to delete game');
      console.error(err);
    }
  };

  // Toggle active status
  const handleToggleActive = async (game) => {
    try {
      await gameService.updateGame(game.id, { ...game, is_active: !game.is_active });
      await fetchGames();
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  // Modal save callback
  const handleModalSave = async (gameData) => {
    try {
      if (editingGame) {
        await gameService.updateGame(editingGame.id, gameData);
      } else {
        await gameService.createGame(gameData);
      }
      await fetchGames();
      setModalOpen(false);
    } catch (err) {
      alert('Failed to save game');
      console.error(err);
    }
  };

  return (
    <div className="game-admin-container">
      <div className="game-admin-header">
        <h2>Available Games Management</h2>
        <div className="game-admin-actions">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleCreate}>
            <FiPlus /> Add Game
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading games...</div>
      ) : (
        <div className="game-table-wrapper">
          <table className="game-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Genre</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">No games found</td>
                </tr>
              ) : (
                filteredGames.map((game, index) => (
                  <tr key={game.id}>
                    <td>{index + 1}</td>
                    <td>
                      <img src={game.image_url} alt={game.name} className="game-thumbnail" />
                    </td>
                    <td>{game.name}</td>
                    <td>{game.genre}</td>
                    <td>{game.platform || 'All'}</td>
                    <td>
                      <span className={`status-badge ${game.is_active ? 'active' : 'inactive'}`}>
                        {game.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-btn toggle"
                          onClick={() => handleToggleActive(game)}
                          title={game.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {game.is_active ? <FiToggleLeft /> : <FiToggleRight />}
                        </button>
                        <button
                          className="icon-btn edit"
                          onClick={() => handleEdit(game)}
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={() => handleDelete(game.id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <GameFormModal
          game={editingGame}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default AvailableGames;