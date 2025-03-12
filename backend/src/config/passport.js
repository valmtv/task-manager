const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../config/database');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5001/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const [rows] = await pool.execute(
          'SELECT * FROM Users WHERE email = ?',
          [email]
        );

        let user;
        if (rows.length > 0) {
          user = rows[0];
        } else {
          const [result] = await pool.execute(
            'INSERT INTO Users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
            [name, email, '', 3]
          );

          user = { id: result.insertId, name, email, role_id: 3 };
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Users WHERE id = ?', [id]);

    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

