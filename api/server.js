import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        // Get all servers
        try {
            const result = await pool.query('SELECT * FROM servers ORDER BY added_date DESC');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database error' });
        }
    } else if (req.method === 'POST') {
        // Add new server
        const { name, icon, description, category, members, online, invite, tags } = req.body;
        
        try {
            const result = await pool.query(
                'INSERT INTO servers (name, icon, description, category, members, online, invite, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [name, icon, description, category, members, online, invite, tags]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
