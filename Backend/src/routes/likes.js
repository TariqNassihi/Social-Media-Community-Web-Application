const express = require('express');
const db = require('../../db.js');

const router = express.Router();



// Like a post
router.post('/like/:postId', async (req, res) => {
    const { postId } = req.params;

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Check if the user has already reacted to the post
        const [existingReaction] = await db.promise().query(
            'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
            [req.user.id, postId]
        );

        if (existingReaction.length > 0) {
            // Update the reaction to 'like'
            await db.promise().query(
                'UPDATE likes SET reaction = ? WHERE user_id = ? AND post_id = ?',
                ['like', req.user.id, postId]
            );
            res.status(200).json({ message: 'Reaction updated to "like" successfully' });
        } else {
            // Insert a new 'like' reaction if he hasn't already reacted to the post
            await db.promise().query(
                'INSERT INTO likes (user_id, post_id, reaction) VALUES (?, ?, ?)',
                [req.user.id, postId, 'like']
            );
            res.status(201).json({ message: 'Post liked successfully' });
        }
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while liking the post' });
    }
});





// Dislike a post
router.post('/dislike/:postId', async (req, res) => {
    const { postId } = req.params;

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Check if the user has already reacted to the post
        const [existingReaction] = await db.promise().query(
            'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
            [req.user.id, postId]
        );

        if (existingReaction.length > 0) {
            // Update the reaction to 'dislike'
            await db.promise().query(
                'UPDATE likes SET reaction = ? WHERE user_id = ? AND post_id = ?',
                ['dislike', req.user.id, postId]
            );
            res.status(200).json({ message: 'Reaction updated to "dislike" successfully' });
        } else {
            // Insert a new 'dislike' reaction if he hasn't already reacted to the post
            await db.promise().query(
                'INSERT INTO likes (user_id, post_id, reaction) VALUES (?, ?, ?)',
                [req.user.id, postId, 'dislike']
            );
            res.status(201).json({ message: 'Post disliked successfully' });
        }
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while disliking the post' });
    }
});





// Remove a reaction from a post
router.delete('/:postId', async (req, res) => {
    const { postId } = req.params;

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Delete the user's reaction to the post
        const [result] = await db.promise().query(
            'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
            [req.user.id, postId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No reaction found to remove' });
        }

        res.status(200).json({ message: 'Reaction removed successfully' });
    } catch (err) {
        console.error('Error removing reaction:', err);
        res.status(500).json({ error: 'An error occurred while removing the reaction' });
    }
});




// Get total likes and dislikes for a post
router.get('/count/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        // Fetch the count of likes and dislikes for the post
        const [reactions] = await db.promise().query(
            'SELECT reaction, COUNT(*) AS count FROM likes WHERE post_id = ? GROUP BY reaction',
            [postId]
        );

        // Organize the results into a structured response
        const likes = reactions.find((r) => r.reaction === 'like')?.count || 0;
        const dislikes = reactions.find((r) => r.reaction === 'dislike')?.count || 0;

        res.status(200).json({ likes, dislikes });
    } catch (err) {
        console.error('Error fetching likes and dislikes:', err);
        res.status(500).json({ error: 'An error occurred while fetching the reactions count' });
    }
});





// Get the current user's reaction to a post
router.get('/reaction/:postId', async (req, res) => {
    const { postId } = req.params;

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Fetch the user's reaction to the post
        const [reaction] = await db.promise().query(
            'SELECT reaction FROM likes WHERE user_id = ? AND post_id = ?',
            [req.user.id, postId]
        );

        if (reaction.length > 0) {
            res.status(200).json({ reaction: reaction[0].reaction });
        } else {
            res.status(404).json({ message: 'No reaction found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching the reaction' });
    }
});



// Add or update a reaction on a comment
router.post('/comments/react/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { reaction } = req.body; // 'like' or 'dislike'

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Check if the user has already reacted to the comment
        const [existingReaction] = await db.promise().query(
            'SELECT * FROM comment_reactions WHERE user_id = ? AND comment_id = ?',
            [req.user.id, commentId]
        );

        if (existingReaction.length > 0) {
            // Update the reaction to the comment
            await db.promise().query(
                'UPDATE comment_reactions SET reaction = ? WHERE user_id = ? AND comment_id = ?',
                [reaction, req.user.id, commentId]
            );
            res.status(200).json({ message: 'Reaction updated successfully' });
        } else {
            // Add a new reaction to the comment if the user hasn't already raact to the comment 
            await db.promise().query(
                'INSERT INTO comment_reactions (user_id, comment_id, reaction) VALUES (?, ?, ?)',
                [req.user.id, commentId, reaction]
            );
            res.status(201).json({ message: 'Reaction added successfully' });
        }
    } catch (err) {
        console.error('Error reacting to comment:', err);
        res.status(500).json({ error: 'An error occurred while reacting to the comment' });
    }
});




// Get reaction count for a comment
router.get('/comments/reaction-count/:commentId', async (req, res) => {
    const { commentId } = req.params;

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Fetch the count of reactions for the comment
        const [reactions] = await db.promise().query(
            'SELECT reaction, COUNT(*) AS count FROM comment_reactions WHERE comment_id = ? GROUP BY reaction',
            [commentId]
        );

        const likes = reactions.find((r) => r.reaction === 'like')?.count || 0;
        const dislikes = reactions.find((r) => r.reaction === 'dislike')?.count || 0;

        res.status(200).json({ likes, dislikes });
    } catch (err) {
        console.error('Error fetching reactions:', err);
        res.status(500).json({ error: 'An error occurred while fetching reactions' });
    }
});







// Get the current user's reaction to a comment
router.get('/comments/reaction/:commentId', async (req, res) => {
    const { commentId } = req.params;

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Fetch the user's reaction to the comment
        const [reaction] = await db.promise().query(
            'SELECT reaction FROM comment_reactions WHERE user_id = ? AND comment_id = ?',
            [req.user.id, commentId]
        );

        if (reaction.length > 0) {
            res.status(200).json({ reaction: reaction[0].reaction });
        } else {
            res.status(404).json({ message: 'No reaction found' });
        }
    } catch (err) {
        console.error('Error fetching reaction:', err);
        res.status(500).json({ error: 'An error occurred while fetching the reaction' });
    }
});





// Remove a reaction to a comment
router.delete('/comments/reaction/:commentId', async (req, res) => {
    const { commentId } = req.params;

    // Check if user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Delete the user's reaction to the comment
        const [result] = await db.promise().query(
            'DELETE FROM comment_reactions WHERE user_id = ? AND comment_id = ?',
            [req.user.id, commentId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Reaction removed successfully' });
        } else {
            res.status(404).json({ message: 'No reaction found to remove' });
        }
    } catch (err) {
        console.error('Error removing reaction:', err);
        res.status(500).json({ error: 'An error occurred while removing the reaction' });
    }
});





module.exports = router;
