const express = require('express');
const db = require('../../db.js');
const axios = require('axios');
const {validatePost} = require('../inputValid');
const { validationResult } = require('express-validator');
const router = express.Router();



// Create a new post
router.post('/',validatePost ,async (req, res) => {

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });// Return validation errors
    }

    const { title, content, image, tags, threadId } = req.body;

    // Check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }


    try {
        // Verify if the thread exists
        const [thread] = await db.promise().query('SELECT id FROM threads WHERE id = ?', [threadId]);

        if (thread.length === 0) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        // Insert the new post into the database
        const [result] = await db.promise().query(
            'INSERT INTO posts (title, content, image_url, tags, authorId, threadId) VALUES (?,?, ?, ?, ?, ?)',
            [title, content, image, tags, req.user.id, threadId]
        );

        res.status(201).json({
            message: 'Post created successfully',
            postId: result.insertId,
            title,
            content,
            image,
            tags,
            authorId: req.user.id,
            threadId
        });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'An error occurred while creating the post' });
    }
});



// Get all posts
router.get('/', async (req, res) => {
    try {
        // Fetch all posts with author information
        const [posts] = await db.promise().query(
            `SELECT posts.id, posts.content, posts.created_at, posts.title, 
                    posts.image_url, posts.tags, posts.reading_time, users.name AS username,users.image_profile_url AS profile_img
             FROM posts
             JOIN users ON posts.authorId = users.id`
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: 'No posts found' });
        }

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the posts' });
    }
});




// Get post details by postId
router.get('/postId/:postId', async (req, res) => {
    const { postId } = req.params;
  
    try {
        // Fetch post by author_id including author information
        const [post] = await db.promise().query(
            'SELECT posts.*, users.name AS author_name, users.image_profile_url AS author_image FROM posts JOIN users ON posts.authorId = users.id WHERE posts.id = ?'
            , [postId]);
  
        if (post.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
  
        res.status(200).json(post[0]);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the post' });
    }
  });





// Get posts by threadId
router.get('/thread/:threadId', async (req, res) => {
    const { threadId } = req.params;
  
    try {
        // Fetch posts for the specified threadId
        const [posts] = await db.promise().query(
            'SELECT posts.*, users.name AS author_name, users.id AS user_id ,users.image_profile_url AS author_image FROM posts JOIN users ON posts.authorId = users.id WHERE threadId = ?', 
            [threadId]);
  
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the posts' });
    }
  });    




// Get posts by userId
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
        // Fetch posts authored by the specified user
        const [posts] = await db.promise().query('SELECT * FROM posts WHERE authorId = ?', [userId]);
  
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the posts' });
    }
  });  





// Get likes and dislikes for a post
router.get('/reactions/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        // Fetch reactions (likes and dislikes) with user information for a post
        const [reactions] = await db.promise().query(
            'SELECT l.reaction, u.name AS user_name FROM likes l ' +
            'JOIN users u ON l.user_id = u.id ' +
            'WHERE l.post_id = ?',
            [postId]
        );

        if (reactions.length === 0) {
            return res.status(404).json({ error: 'No reactions found for this post' });
        }
        res.status(200).json({
            message: 'Reactions retrieved successfully',
            reactions
        });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while retrieving the reactions' });
    }
});





// Edit an existing post
router.put('/:postId',validatePost ,async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });// Return validation errors
    }
    
    const { postId } = req.params;
    const { title, content, image_url, tags } = req.body;

    // Check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Verify if the post exists and belongs to the logged-in user
        const [post] = await db.promise().query(
            'SELECT * FROM posts WHERE id = ?',
            [postId]
        );

        if (post.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post[0].authorId !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own posts' });
        }

        // Update the post in the database
        await db.promise().query(
            'UPDATE posts SET title = ?, content = ?, image_url = ?, tags= ? WHERE id = ?',
            [title, content, image_url, tags, postId]
        );

        res.status(200).json({ message: 'Post updated successfully' });
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'An error occurred while updating the post' });
    }
});





// Delete a post
router.delete('/:postId', async (req, res) => {
    const { postId } = req.params;

    // Check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Verify if the post exists and belongs to the logged-in user
        const [post] = await db.promise().query(
            'SELECT * FROM posts WHERE id = ?',
            [postId]
        );
        if (!post.length) {
            return res.status(404).json({ error: 'Post not found' });
        }
       
        if (post[0].authorId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own posts' });
        }

        // Delete comments associated with the post
        await db.promise().query(
            'DELETE FROM comments WHERE post_id = ?',
            [postId]
        );

        // Delete likes/dislikes associated with the post
        await db.promise().query(
            'DELETE FROM likes WHERE post_id = ?',
            [postId]
        );

        // Delete the post itself
        await db.promise().query(
            'DELETE FROM posts WHERE id = ?',
            [postId]
        );

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while deleting the post' });
    }
});






// Fetch posts with geolocation based on tags
router.get('/post-with-locations', async (req, res) => {
    const [posts] = await db.promise().query(
      `SELECT posts.id, posts.content, posts.created_at, posts.title, 
              posts.image_url, posts.tags, posts.reading_time, 
              users.name AS username, users.id AS user_id,
              users.image_profile_url AS profile_img
       FROM posts
       JOIN users ON posts.authorId = users.id
       ORDER BY posts.created_at DESC` 
    );
  
    const apiKey = 'ad02d4071783442e8bde106c21af1d9c';
  
    try {
      const postWithLocations = await Promise.all(
        posts.map(async (post) => {
          if (post.tags) {
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(post.tags)}&key=${apiKey}`// gives latitude
            );
            const location = response.data.results[0]?.geometry || null;
            return { ...post, location };
          }
          return post;
        })
      );
      res.json(postWithLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).send('Error processing blogs with locations.');
    }
  });




// Fetch popular posts based on likes/dislikes
router.get('/popular-posts', async (req, res) => {
      try {
        //popular = likes - dislikes
          const [results] = await db.promise().query(` 
              SELECT 
                  p.id, p.title, p.content, p.created_at, p.image_url,u.image_profile_url AS profile_img ,p.tags,
              u.name AS username,u.id AS user_id,
                  (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND reaction = 'like') -
                  (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND reaction = 'dislike') AS like_count
              FROM posts p
                JOIN users u ON p.authorId = u.id
              ORDER BY like_count DESC
          `);
          res.json(results);
      } catch (error) {
          console.error("Error fetching popular posts:", error);
          res.status(500).json({ error: "Error fetching popular posts" });
      }
  });





// Get liked posts of a user
router.get('/liked-posts/:userId', async (req, res) => {
    const { userId } = req.params;

    // Check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    try {
        // Fetch posts liked by the user
        const [likedPosts] = await db.promise().query(
            `SELECT posts.*, users.image_profile_url, users.name
             FROM likes 
             JOIN posts ON likes.post_id = posts.id 
             JOIN users ON posts.authorId = users.id 
             WHERE likes.user_id = ? AND likes.reaction = 'like'`,
            [userId]
        );

        res.status(200).json(likedPosts);
    } catch (err) {
        console.error('Error fetching liked posts:', err);
        res.status(500).json({ error: 'An error occurred while fetching liked posts' });
    }
});



// Get posts from followed users
router.get('/followed-posts', async (req, res) => {
    try {

        // Check if the user is logged in
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: Please log in first' });
        }

      const userId = req.user.id;

      // Fetch IDs of followed users
      const [followedUsers] = await db.promise().query(
        "SELECT followed_id FROM followers WHERE follower_id = ?", 
        [userId]
      );

      // If no followed users exist
      if (followedUsers.length === 0) {
        return res.status(200).json({ posts: [] });
      }

      // Fetch posts author_id by followed users
      const [posts] = await db.promise().query(
        `SELECT p.title, 
                p.id,
                p.content, 
                u.name AS username, 
                u.id AS user_id,
                p.created_at, 
                p.image_url, 
                u.image_profile_url AS profile_img
         FROM posts p
         JOIN users u ON p.authorId = u.id
         WHERE p.authorId IN (?)`, 
         [followedUsers.map((user) => user.followed_id)]
      );

      res.status(200).json({ posts });
    } catch (error) {
      console.error('Error fetching followed posts:', error);
      res.status(500).json({ message: 'Failed to fetch followed posts.' });
    }
});

module.exports = router;
