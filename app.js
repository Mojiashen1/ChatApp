var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var validate = require('express-validator')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook');
var routes = require('./routes/index');
var auth = require('./routes/auth');
var models = require('./models/models');
var User = models.User;



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(validate());
// Passport stuff here
// YOUR CODE HERE
app.use(session({ secret: 'keyboard cat' }));
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


// Tell passport how to read our user models
passport.use(new LocalStrategy(function(username, password, done) {
    // Find the user with the given username
    // console.log("Looking up user " + username);
    console.log(models);
    console.log(User);
    console.log('hello')
    User.findOne({ username: username }, function (err, user) {
      // console.log("Found user " + user + " with error " + err);
      // if there's an error, finish trying to authenticate (auth failed)

      if (err) {
        console.log(err);
        return done(err);
      }
      // if no user present, auth failed
      if (!user) {
        console.log(user);
        return done(null, false);
      }
      // if passwords do not match, auth failed
      if (user.password !== password) {
        console.log("Password mismatch");
        return done(null, false);
      }
      // auth has has succeeded
      return done(null, user);
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());

//passport-facebook
// passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

app.use('/', auth(passport));
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
