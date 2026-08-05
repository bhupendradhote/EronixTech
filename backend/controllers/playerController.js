const db = require('../config/db');

// ========== Get Players with Filters & Pagination ==========
exports.getPlayers = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const {
            search,
            is_active,
            page = 1,
            limit = 20
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let sql = `SELECT 
            id, username, email, full_name, phone_number, is_active, 
            coins, level, last_login, created_at, updated_at
            FROM game_users 
            WHERE 1=1`;
        const params = [];

        if (search) {
            sql += ' AND (full_name LIKE ? OR username LIKE ? OR email LIKE ? OR phone_number LIKE ?)';
            const like = `%${search}%`;
            params.push(like, like, like, like);
        }

        if (is_active !== undefined && is_active !== '') {
            sql += ' AND is_active = ?';
            params.push(is_active);
        }

        // Count total
        const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
        const [countRows] = await db.execute(countSql, params);
        const total = countRows[0]?.total || 0;

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [rows] = await db.execute(sql, params);

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get Players Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Get Single Player ==========
exports.getPlayerById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            'SELECT id, username, email, full_name, phone_number, is_active, coins, level, last_login, created_at, updated_at FROM game_users WHERE id = ?',
            [id]
        );
        if (!rows.length) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.json({ success: true, player: rows[0] });
    } catch (error) {
        console.error('Get Player By ID Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Update Player ==========
exports.updatePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone_number, email, username, is_active, coins, level } = req.body;

        const [existing] = await db.execute('SELECT * FROM game_users WHERE id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ message: 'Player not found' });
        }

        await db.execute(
            `UPDATE game_users 
             SET full_name = ?, phone_number = ?, email = ?, username = ?, 
                 is_active = ?, coins = ?, level = ?
             WHERE id = ?`,
            [
                full_name || existing[0].full_name,
                phone_number || existing[0].phone_number,
                email || existing[0].email,
                username || existing[0].username,
                is_active !== undefined ? is_active : existing[0].is_active,
                coins !== undefined ? coins : existing[0].coins,
                level !== undefined ? level : existing[0].level,
                id
            ]
        );

        const [updated] = await db.execute('SELECT * FROM game_users WHERE id = ?', [id]);
        res.json({
            success: true,
            message: 'Player updated successfully',
            player: updated[0]
        });
    } catch (error) {
        console.error('Update Player Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== Toggle Player Status ==========
exports.togglePlayerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.execute('SELECT is_active FROM game_users WHERE id = ?', [id]);
        if (!existing.length) {
            return res.status(404).json({ message: 'Player not found' });
        }
        const newStatus = existing[0].is_active ? 0 : 1;
        await db.execute('UPDATE game_users SET is_active = ? WHERE id = ?', [newStatus, id]);
        res.json({
            success: true,
            message: `Player ${newStatus ? 'activated' : 'deactivated'} successfully`,
            is_active: newStatus
        });
    } catch (error) {
        console.error('Toggle Player Status Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};