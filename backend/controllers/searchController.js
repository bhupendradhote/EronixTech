const db = require('../config/db');

const searchController = {
    search: async (req, res) => {
        try {
            const { q } = req.query;
            if (!q || q.trim() === '') {
                return res.status(400).json({ success: false, message: 'Query required' });
            }

            // Split the search query into individual words (e.g., "FAB 1 Red" -> ["FAB", "1", "Red"])
            const keywords = q.split(' ').filter(word => word.length > 0);
            
            // Build the WHERE clause dynamically for all keywords
            let whereClauses = [];
            let params = [];
            
            keywords.forEach(word => {
                const searchPattern = `%${word}%`;
                whereClauses.push(`(p.name LIKE ? OR p.slug LIKE ? OR c.name LIKE ? OR b.name LIKE ?)`);
                params.push(searchPattern, searchPattern, searchPattern, searchPattern);
            });

            const query = `
                SELECT DISTINCT p.*, c.name AS category_name, b.name AS brand_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN brands b ON p.brand_id = b.id
                WHERE ${whereClauses.join(' AND ')}
                AND p.deleted_at IS NULL AND p.status = 'active'
                LIMIT 30
            `;

            const [results] = await db.execute(query, params);
            
            // Format images
            const formattedResults = results.map(item => {
                if (item.images && typeof item.images === 'string') {
                    try { item.images = JSON.parse(item.images); } catch (e) {}
                }
                return item;
            });

            res.status(200).json({ success: true, data: formattedResults });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Search failed' });
        }
    }
};

module.exports = searchController;