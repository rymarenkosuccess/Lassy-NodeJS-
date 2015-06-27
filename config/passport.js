
var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , BearerStrategy = require('passport-http-bearer').Strategy
  , User = mongoose.model('User')
  , Lassy = mongoose.model('Lassy')


module.exports = function (passport, config) {
  // require('./initializer')

  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user)
    })
  })

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'mobile',
      passwordField: 'password'
    },
    function(username, password, done) {
      //makes sure that mobile number does not have any hyphens.
      User.findOne({ mobile_number: username.replace(/-/g, "") }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Unknown user' })
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' })
        }
        return done(null, user)
      })
    }
  ))

  passport.use(new BearerStrategy(
    function(token, done) {
      Lassy.findOne({ "device.token": token }, function (err, lassy) {
        if (err) { return done(err); }
        if (!lassy) { return done(null, false); }
        return done(null, lassy, { scope: 'all' });
      });
    }
  ));


}
