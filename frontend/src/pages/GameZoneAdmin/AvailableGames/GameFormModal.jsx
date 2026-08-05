import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './AvailableGames.css';

const GameFormModal = ({ game, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    image_url: '',
    description: '',
    platform: 'all',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name || '',
        genre: game.genre || '',
        image_url: game.image_url || '',
        description: game.description || '',
        platform: game.platform || 'all',
      });
    } else {
      setFormData({
        name: '',
        genre: '',
        image_url: '',
        description: '',
        platform: 'all',
      });
    }
  }, [game]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name.trim() || !formData.genre.trim() || !formData.image_url.trim()) {
      setError('Name, genre, and image URL are required');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      // Modal will close via parent onSave callback
    } catch (err) {
      setError(err.message || 'Failed to save game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{game ? 'Edit Game' : 'Add New Game'}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Game Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., EA FC 26"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="genre">Genre *</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="e.g., Football Simulation"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image_url">Image URL *</label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
            />
            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the game"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
            >
              <option value="all">All Platforms</option>
              <option value="ps5">PS5</option>
              <option value="pc">PC</option>
              <option value="xbox">Xbox</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : game ? 'Update Game' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameFormModal;