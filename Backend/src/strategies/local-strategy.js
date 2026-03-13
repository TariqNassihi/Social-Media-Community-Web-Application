const passport = require('passport');
const strategy = require('passport-local');
const db = require('../../db.js');
const bcrypt = require('bcrypt'); 

// Store user ID in the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});


// Retrieve user details using the stored ID
passport.deserializeUser(async (id, done) => {
    try {
        // fetch user
        const [rows] = await db.promise().query('SELECT id, name, email,image_profile_url FROM users WHERE id = ?', [id]);

        // check if user exists
        if (rows.length === 0) throw new Error("User not found");

        done(null, rows[0]);
    } catch (err) {
        done(err, null);
    }
});
 
// Define the local strategy for user authentication
passport.use(
    new strategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            // fetch the user with the given email
            const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

            // check if user exists
            if (rows.length === 0) {
                throw new Error("User not found");
            }

            const user = rows[0];

            // Compare the provided password with the stored hashed password
            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            // check if the password is correct
            if (!isPasswordCorrect) {
                throw new Error("Password is incorrect"); 
            }


            done(null, user);
        } catch (err) {
            done(null, false, err);
        }
    })
);
