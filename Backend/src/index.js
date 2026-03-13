
require('dotenv').config();  


const express = require('express'); 
const session = require('express-session');
const passport = require('passport');
const strategy = require ('./strategies/local-strategy.js');
const db = require('../db');
const cors = require('cors'); 



const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const threadRoutes = require('./routes/thread');
const followRoutes = require('./routes/user');
const likesRoutes = require('./routes/likes');
const commentsRoutes = require('./routes/comments');
const newsRoutes = require('./routes/news');
const searchRoutes = require('./routes/search');


const app = express(); 

// Middleware to parse incoming JSON requests
app.use(express.json()); 


const port = 8000;


// Start the server and listen on the specified port
app.listen(port, () => { 
    console.log(`Running on port ${port}`);
});




const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
};


app.use(cors(corsOptions));



// Session configuration
app.use(session({
  secret:  process.env.sleutel_session, 
  resave: false, 
  saveUninitialized: false,
}));



// Initialize Passport.js for authentication
app.use(passport.initialize());
app.use(passport.session());

// Use routers for handling specific endpoints
app.use('/auth', authRoutes); // Authentication routes
app.use('/posts', postRoutes); // Post-related routes
app.use('/threads', threadRoutes); // Thread-related routes
app.use('/user', followRoutes); // User-related routes
app.use('/react', likesRoutes); // Like/dislike routes
app.use('/comments', commentsRoutes); // Comment-related routes
app.use('/news', newsRoutes); // News-related routes
app.use('/search', searchRoutes); // Search-related routes



// Default route to check server status
app.get("/", (request, response) => {
    response.status(200).send("Server is running."); 
});
