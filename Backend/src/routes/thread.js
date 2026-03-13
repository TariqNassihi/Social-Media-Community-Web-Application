const express = require('express');
const db = require('../../db.js');
const { validateThread} = require('../inputValid');
const { validationResult } = require('express-validator');

const router = express.Router();




//Route to create a new thread
router.post('/', validateThread , async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });  // Return validation errors
  }
    
      const { title } = req.body;

    // Check if the user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Check if the thread title already exists in the database
        const [existingThread] = await db.promise().query(
            'SELECT * FROM threads WHERE title = ?',
            [title]
        );

        if (existingThread.length > 0) {
            return res.status(409).json({ error: 'A thread with this title already exists' });
        }

        // Insert the new thread into the database
        const [result] = await db.promise().query(
            'INSERT INTO threads (user_id, title) VALUES (?, ?)',
            [req.user.id, title]
        );

        res.status(201).json({
            message: 'Thread created successfully',
            threadId: result.insertId,
            title
        });
    } catch (err) {
        console.error('Error creating thread:', err);
        res.status(500).json({ error: 'An error occurred while creating the thread' });
    }
});



// Route to fetch all threads
router.get('/', async (req, res) => {
    try {
        // Fetch all threads from the database
        const [threads] = await db.promise().query('SELECT * FROM threads');
        res.status(200).json(threads);
    } catch (err) {
        console.error('Error fetching threads:', err);
        res.status(500).json({ error: 'An error occurred while fetching threads' });
    }
});



// Route to fetch a single thread by ID
router.get('/:threadId', async (req, res) => {
    const { threadId } = req.params;

    try {
        // Fetch the thread with the specified ID from the database
        const [posts] = await db.promise().query('SELECT * FROM threads WHERE id = ?', [threadId]);

        // Check if the thread exists
        if (posts.length === 0) {
            return res.status(404).json({ error: 'No thread found' });
        }

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the thread' });
    }
});


module.exports = router;
