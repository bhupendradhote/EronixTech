import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import gameService from '../../../services/gameService';
import './AvailableGames.css';

const GameFormModal = ({ game, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    image_url: '',
    description: '',
    game_device_id: '',
  });
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDevices, setFetchingDevices] = useState(true);
  const [error, setError] = useState('');

  // Fetch available devices on mount
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const data = await gameService.getDevices();
        setDevices(data);
      } catch (err) {
        console.error('Failed to load devices', err);
        setError('Could not load device list');
      } finally {
        setFetchingDevices(false);
      }
    };
    loadDevices();
  }, []);

  // Populate form when editing an existing game
  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name || '',
        genre: game.genre || '',
        image_url: game.image_url || '',
        description: game.description || '',
        game_device_id: game.game_device_id || '',
      });
    } else {
      setFormData({
        name: '',
        genre: '',
        image_url: '',
        description: '',
        game_device_id: '',
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

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Game name is required');
      setLoading(false);
      return;
    }
    if (!formData.genre.trim()) {
      setError('Genre is required');
      setLoading(false);
      return;
    }
    if (!formData.image_url.trim()) {
      setError('Image URL is required');
      setLoading(false);
      return;
    }
    if (!formData.game_device_id) {
      setError('Please select a device');
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

          {/* Name */}
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

          {/* Genre */}
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

          {/* Image URL */}
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

          {/* Description */}
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

          {/* Device Dropdown */}
          <div className="form-group">
            <label htmlFor="game_device_id">Device *</label>
            <select
              id="game_device_id"
              name="game_device_id"
              value={formData.game_device_id}
              onChange={handleChange}
              disabled={fetchingDevices}
              required
            >
              <option value="">
                {fetchingDevices ? 'Loading devices...' : 'Select a device'}
              </option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || fetchingDevices}>
              {loading ? 'Saving...' : game ? 'Update Game' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameFormModal;