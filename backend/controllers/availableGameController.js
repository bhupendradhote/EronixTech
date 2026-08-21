const AvailableGame = require('../models/AvailableGame');

// ========== PUBLIC ==========
// @desc    Get all active games
// @route   GET /api/available-games
exports.getActiveGames = async (req, res) => {
    try {
        const games = await AvailableGame.getActiveGames();
        res.json({ success: true, games });
    } catch (error) {
        console.error('Get Active Games Error:', error);
        res.status(500).json({ message: 'Server error fetching games' });
    }
};

// ========== ADMIN CRUD ==========
// @desc    Get all games (including inactive)
// @route   GET /api/admin/available-games
// @access  Admin
exports.getAllGames = async (req, res) => {
    try {
        const games = await AvailableGame.getAllGames();
        res.json({ success: true, games });
    } catch (error) {
        console.error('Get All Games Error:', error);
        res.status(500).json({ message: 'Server error fetching games' });
    }
};

// @desc    Get single game by ID
// @route   GET /api/admin/available-games/:id
// @access  Admin
exports.getGameById = async (req, res) => {
    try {
        const game = await AvailableGame.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json({ success: true, game });
    } catch (error) {
        console.error('Get Game By ID Error:', error);
        res.status(500).json({ message: 'Server error fetching game' });
    }
};

// @desc    Create a new game
// @route   POST /api/admin/available-games
// @access  Admin
exports.createGame = async (req, res) => {
    try {
        const { name, genre, image_url, description, platform } = req.body;

        if (!name || !genre || !image_url) {
            return res.status(400).json({ message: 'Name, genre, and image URL are required' });
        }

        const gameId = await AvailableGame.create({
            name,
            genre,
            image_url,
            description,
            platform
        });

        const newGame = await AvailableGame.findById(gameId);
        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            game: newGame
        });
    } catch (error) {
        console.error('Create Game Error:', error);
        res.status(500).json({ message: 'Server error creating game' });
    }
};

// @desc    Update an existing game
// @route   PUT /api/admin/available-games/:id
// @access  Admin
exports.updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, genre, image_url, description, platform, is_active } = req.body;

        const existingGame = await AvailableGame.findById(id);
        if (!existingGame) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const updated = await AvailableGame.update(id, {
            name: name || existingGame.name,
            genre: genre || existingGame.genre,
            image_url: image_url || existingGame.image_url,
            description: description !== undefined ? description : existingGame.description,
            platform: platform || existingGame.platform,
            is_active: is_active !== undefined ? is_active : existingGame.is_active
        });

        if (updated === 0) {
            return res.status(400).json({ message: 'Update failed' });
        }

        const updatedGame = await AvailableGame.findById(id);
        res.json({
            success: true,
            message: 'Game updated successfully',
            game: updatedGame
        });
    } catch (error) {
        console.error('Update Game Error:', error);
        res.status(500).json({ message: 'Server error updating game' });
    }
};

// @desc    Soft delete a game (set inactive)
// @route   DELETE /api/admin/available-games/:id
// @access  Admin
exports.deleteGame = async (req, res) => {
    try {
        const { id } = req.params;

        const existingGame = await AvailableGame.findById(id);
        if (!existingGame) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const deleted = await AvailableGame.delete(id);
        if (deleted === 0) {
            return res.status(400).json({ message: 'Delete failed' });
        }

        res.json({
            success: true,
            message: 'Game deactivated successfully'
        });
    } catch (error) {
        console.error('Delete Game Error:', error);
        res.status(500).json({ message: 'Server error deleting game' });
    }
};

// ... other methods remain the same except createGame and updateGame

exports.createGame = async (req, res) => {
    try {
        const { name, genre, image_url, description, game_device_id } = req.body;

        // Validate required fields
        if (!name || !genre || !image_url || !game_device_id) {
            return res.status(400).json({
                message: 'Name, genre, image URL, and device are required'
            });
        }

        // Optional: verify that game_device_id exists (you can add a helper)
        // const device = await GameDevice.findById(game_device_id);
        // if (!device) return res.status(400).json({ message: 'Invalid device' });

        const gameId = await AvailableGame.create({
            name,
            genre,
            image_url,
            description,
            game_device_id
        });

        const newGame = await AvailableGame.findById(gameId);
        res.status(201).json({
            success: true,
            message: 'Game created successfully',
            game: newGame
        });
    } catch (error) {
        console.error('Create Game Error:', error);
        res.status(500).json({ message: 'Server error creating game' });
    }
};

exports.updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, genre, image_url, description, game_device_id, is_active } = req.body;

        const existingGame = await AvailableGame.findById(id);
        if (!existingGame) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // If game_device_id is provided, verify it exists (optional)
        // if (game_device_id) { ... }

        const updated = await AvailableGame.update(id, {
            name: name || existingGame.name,
            genre: genre || existingGame.genre,
            image_url: image_url || existingGame.image_url,
            description: description !== undefined ? description : existingGame.description,
            game_device_id: game_device_id || existingGame.game_device_id,
            is_active: is_active !== undefined ? is_active : existingGame.is_active
        });

        if (updated === 0) {
            return res.status(400).json({ message: 'Update failed' });
        }

        const updatedGame = await AvailableGame.findById(id);
        res.json({
            success: true,
            message: 'Game updated successfully',
            game: updatedGame
        });
    } catch (error) {
        console.error('Update Game Error:', error);
        res.status(500).json({ message: 'Server error updating game' });
    }
};