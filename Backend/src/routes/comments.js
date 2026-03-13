const express = require('express');
const db = require('../../db.js');
const { validateComment} = require('../inputValid');
const { validationResult } = require('express-validator');

const router = express.Router();


// Add a comment to a post
router.post('/post/:postId',validateComment ,async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }

    const { postId } = req.params;
    const { content } = req.body;

    // Check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }


    try {
        // Insert the comment into the database
        const [result] = await db.promise().query(
            'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
            [postId, req.user.id, content]
        );

        res.status(201).json({
            message: 'Comment added successfully',
            commentId: result.insertId, 
            content
        });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while adding the comment' });
    }
});





// Retrieve comments for a post
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        // Fetch comments with likes and dislikes count
        const [comments] = await db.promise().query(
            `
            SELECT 
                c.id, 
                c.content, 
                c.created_at, 
                u.name AS user_name, 
                u.image_profile_url AS user_image, 
                u.id AS user_id,
                -- Subquery to count likes
                COALESCE(SUM(CASE WHEN cr.reaction = 'like' THEN 1 ELSE 0 END), 0) AS likes,
                -- Subquery to count dislikes
                COALESCE(SUM(CASE WHEN cr.reaction = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes
            FROM 
                comments c
            JOIN 
                users u ON c.user_id = u.id
            LEFT JOIN 
                comment_reactions cr ON c.id = cr.comment_id
            WHERE 
                c.post_id = ?
            GROUP BY 
                c.id
            ORDER BY 
                c.created_at DESC
            `,
            [postId]
        );

        res.status(200).json(comments);
    } catch (err) {
        console.error('Error retrieving comments:', err);
        res.status(500).json({ error: 'An error occurred while retrieving the comments' });
    }
});




// Delete a comment for a post
router.delete('/:postId/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;

    // Check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Check if the comment exists
        const [comment] = await db.promise().query(
            'SELECT * FROM comments WHERE id = ? AND post_id = ?',
            [commentId, postId]
        );

        if (comment.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Verify the comment belongs to the logged user
        if (comment[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        // Delete the comment
        await db.promise().query(
            'DELETE FROM comments WHERE id = ? AND post_id = ?',
            [commentId, postId]
        );

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while deleting the comment' });
    }
});





// Add a comment to an article
router.post("/article/:articleId",validateComment ,async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }

    const { articleId } = req.params;
    const { user, content } = req.body;

    try {
        // Check if the article exists
        const [article] = await db.promise().query('SELECT * FROM articles WHERE id = ?', [articleId]);

        if (article.length === 0) {
            return res.status(404).send('Artikel nor found');
        }

        // Insert the comment into the database
        const [result] = await db.promise().query(
            'INSERT INTO commentsArtikel  (article_id, user_id, content) VALUES (?, ?, ?)',
            [articleId, user, content]
        );

        res.status(201).json({
            message: 'Comment added successfully',
            content
        });
      
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while adding the comment');
    }
});




// Retrieve comments for an article
router.get('/article/:articleId', async (req, res) => {
    const { articleId } = req.params;

    try {
        // Fetch comments from the database
        const [comments] = await db.promise().query(
            'SELECT c.id, c.content, c.date, u.name AS user_name, u.image_profile_url AS image_profile FROM commentsArtikel c JOIN users u ON c.user_id = u.id WHERE c.article_id = ? ORDER BY c.date DESC',
            [articleId]
        );

        if (comments.length === 0) {
            return res.status(404).json({ error: 'No comments found for this article' });
        }

        res.status(200).json(comments);
    } catch (err) {
        console.error('Error retrieving comments:', err);
        res.status(500).json({ error: 'An error occurred while retrieving the comments' });
    }
});




// Delete a comment for an article
router.delete('/article/:articleId/:commentId', async (req, res) => {
    const { articleId, commentId } = req.params;

    try {
        // Check if the comment exists
        const [comment] = await db.promise().query(
            'SELECT * FROM commentsArtikel WHERE id = ? AND article_id = ?',
            [commentId, articleId]
        );

        if (comment.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Delete the comment
        await db.promise().query(
            'DELETE FROM commentsArtikel WHERE id = ? AND article_id = ?',
            [commentId, articleId]
        );

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ error: 'An error occurred while deleting the comment' });
    }
});

module.exports = router;
