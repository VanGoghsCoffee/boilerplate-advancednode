const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

module.exports = function(app, myDataBase) {

    passport.use(new LocalStrategy(
        function(username, password, done) {
            myDataBase.findOne({ username: username }, function(err, user) {
            console.log('user ' + username + ' attempted to log in.');
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!bcrypt.compareSync(password, user.password)) { 
                return done(null, false);
            }        
            return done(null, user);
            });
        }
    ));

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "https://chat.davidrochholz.de/auth/github/callback"
    }, (accessToken, refreshToken, profile, cb) => {
        console.log(profile);
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
      });
      
    passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
        done(null, doc);
    });
    });
}