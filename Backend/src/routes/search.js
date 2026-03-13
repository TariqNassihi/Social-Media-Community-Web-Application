const express = require('express');
const db = require('../../db.js'); 

const router = express.Router();

router.get('/', async (req, res) => {
    const query = req.query.query;
  
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }
  
    try {
        const [users] = await db.promise().query(
            'SELECT id, name,image_profile_url FROM users WHERE LOWER(name) LIKE ?',
            [query]
        );
  
        const [threads] = await db.promise().query(
            'SELECT id, title FROM threads WHERE LOWER(title) LIKE ?',
            [query]
        );
  
        const [posts] = await db.promise().query(
            'SELECT id, title FROM posts WHERE LOWER(title) LIKE ?',
            [query]
        );
  
        res.status(200).json({
            message: 'Search results retrieved successfully',
            results: {
                users,
                threads,
                posts
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while retrieving search results' });
    }
  });


  module.exports = router;

