
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../../db.js');
const { validationResult } = require('express-validator');
const { validateRegistration, validateLogin} = require('../inputValid');


const router = express.Router();


// Route for user registration
router.post('/register', validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });  // Return validation errors
  }

  const { name, email, password } = req.body;

  try {
      // Check if user already exists
      const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      if (user.length > 0) {
          return res.status(400).json({ error: 'User already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      await db.promise().query(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword]
      );

      res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
      console.error('Error during registration:', err);
      res.status(500).json({ error: 'An error occurred during registration' });
  }
});



// Route for user login
router.post('/login', validateLogin, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Return validation errors
  }
  next();
}, passport.authenticate('local', { failureRedirect: '/faillogin' }), (req, res) => {
  try { 
      const token = true
      return res.status(200).json({ message: 'User logged in successfully', token }); /// Authenticate user using passport.js with local strategy
  } catch (err) {
      return res.status(500).json({ error: 'An error occurred during login' });
  }
});

  
 
 // Route for user logout 
  router.post('/logout', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: You are not logged in' }); //check if user is logged in
    }

    req.logOut((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ error: 'An error occurred during logout' });
        }

        res.status(200).json({ message: 'Logged out successfully' });
    });
});


// Route to check login status

router.get('/login/status', (req, res) => {
  if (req.user) {
      return res.status(200).json({ // is user is logged in, give user back
          code: 200,
          message: 'User is authenticated',
          user: req.user
      });
  }
  return res.status(401).json({
      message: 'User is not authenticated'
  });
});


module.exports = router;
