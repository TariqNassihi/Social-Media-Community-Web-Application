const express = require('express');
const db = require('../../db.js'); 
const { validateImageProfile,validateName} = require('../inputValid');
const { validationResult } = require('express-validator');

const router = express.Router();

// Route to get all users
router.get('/', async (req, res) => {

    try {
        // Fetch all users from the database
        const [users] = await db.promise().query(
            'SELECT id, name, email, image_profile_url FROM users'
        );

        // Check if there are any users in the database
        if (users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});



// Route to get a specific user by ID or current user
router.get('/:userId', async (req, res) => {
    // Ensure the user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }
 
    // Get the userId from params or use the authenticated user's ID
    const userId = req.params.userId ? req.params.userId : req.user.id;

    try {
        // Fetch user information from the database
        const [userInfo] = await db.promise().query(
            'SELECT id, name, email, image_profile_url FROM users WHERE id = ?',
            [userId]
        );

        // Check if the user exists
        if (userInfo.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userInfo[0];

        // Fetch follower IDs for the user
        const [followersInfo] = await db.promise().query(
            'SELECT follower_id FROM followers WHERE followed_id = ?',
            [userId]
        );

        const followers = followersInfo.map(row => row.follower_id);

        // Fetch following IDs for the user
        const [followingInfo] = await db.promise().query(
            'SELECT followed_id FROM followers WHERE follower_id = ?',
            [userId]
        );

        const following = followingInfo.map(row => row.followed_id);

        // Fetch liked posts IDs for the user
        const [likedPostsInfo] = await db.promise().query(
            'SELECT post_id FROM likes WHERE user_id = ? AND reaction = "like"',
            [userId]
        );
        const likedPosts = likedPostsInfo.map(row => row.post_id);

        // Fetch disliked posts IDs for the user
        const [dislikedPostsInfo] = await db.promise().query(
            'SELECT post_id FROM likes WHERE user_id = ? AND reaction = "dislike"',
            [userId]
        );
        const dislikedPosts = dislikedPostsInfo.map(row => row.post_id);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            image_profile_url: user.image_profile_url,
            followers: followers,
            following: following,
            likedPosts: likedPosts,  
            dislikedPosts: dislikedPosts
        });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting user data' });
    }
});



// Route to follow a user by their username
router.post('/follow/:userName', async (req, res) => {
    // Ensure the user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    const followerId = req.user.id;
    const followed = req.params.userName;

    // Check if the user to follow exists
    const [user] = await db.promise().query(
        'SELECT id FROM users WHERE name = ?',
        [followed]
    );
    if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    const followedId = user[0].id;

    // Prevent users from following themselves
    if (followerId === followedId) {
        return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    try {
        // Check if the user is already being followed
        const [existingFollow] = await db.promise().query(
            'SELECT * FROM followers WHERE follower_id = ? AND followed_id = ?',
            [followerId, followedId]
        );

        if (existingFollow.length > 0) {
            return res.status(400).json({ error: 'You are already following this user' });
        }

        // Add the new follow  to the database
        await db.promise().query(
            'INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)',
            [followerId, followedId]
        );

        res.status(201).json({ message: 'User followed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while following the user' });
    }
});




// Route to unfollow a user by their username
router.delete('/unfollow/:userName', async (req, res) => {
    // Ensure the user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    const followerId = req.user.id;
    const followed = req.params.userName;

    // Check if the user to unfollow exists
    const [user] = await db.promise().query(
        'SELECT id FROM users WHERE name = ?',
        [followed]
    );

    if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    const followedId = user[0].id;

    try {
        // Remove the follow  from the database
        const [result] = await db.promise().query(
            'DELETE FROM followers WHERE follower_id = ? AND followed_id = ?',
            [followerId, followedId]
        );

        res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while unfollowing the user' });
    }
});



// Route to update user profile image
router.put('/update-profile-img', validateImageProfile ,async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });  // Return validation errors
      }

    // Ensure the user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    const userId = req.user.id;
    const { image_profile_url } = req.body;

    try {
        // Update the user's profile image in the database
        await db.promise().query(
            'UPDATE users SET image_profile_url = ? WHERE id = ?',
            [image_profile_url, userId]
        );
        res.status(200).json({ message: 'Profile image updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while updating the profile image' });
    }
});



// Route to update user name
router.put('/update-name',validateName ,async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });  // Return validation errors
      }

    // Ensure the user is authenticated
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }

    const userId = req.user.id;
    const { name } = req.body;


    try {
        // Update the user's name in the database
        await db.promise().query(
            'UPDATE users SET name = ? WHERE id = ?',
            [name, userId]
        );
        res.status(200).json({ message: 'Name updated successfully' });
    } catch (err) {
        // Handle any errors during updating the name
        res.status(500).json({ error: 'An error occurred while updating the name' });
    }
});


module.exports = router;
