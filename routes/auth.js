var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;


module.exports = function(passport) {
    // Add Passport-related auth routes here, to the router!
    router.get('/', function(req, res, next) {
      if (req.isAuthenticated()) {
        res.redirect('/contacts');
      } res.redirect('/login');
    });

    router.get('/signup', function(req, res, next) {
      res.render('signup');
    });

    router.post('/signup', function(req, res) {
      req.checkBody('name', 'name is required').notEmpty();
      req.checkBody('password', 'password is required').notEmpty();
      var errors = req.validationErrors();
      if (req.body.password === req.body.repeatPassword) {
        var u = new User({
          username: req.body.username,
          password: req.body.password
        });
        u.save(function(error) {
          if (error) {
            res.status(400).send("Error creating project: " + error);
          } else {
            res.redirect('/login');
          }
      })
    } else if (error){
        res.render('signup', {
          signup: req.body
        });
    }
  });

  router.get('/login', function(req, res, next) {
    res.render('login');
  });

  // router.post('/login', passport.authenticate('local', {successRedirect: '/contacts',
  // failureRedirect: '/login' }));

  router.post('/login', passport.authenticate('local'), function(req, res){
    console.log(User)
    res.redirect("/contacts");
  });
  //
  // router.post('/login', function(req, res, next) {
  //   var nextStep = passport.authenticate('local', { successRedirect: '/',
  //    failureRedirect: '/login'}, function(a, b, c, d) {
  //      console.log("Got error: " + a + b + JSON.stringify(c) + d);
  //    });
  //    nextStep(req, res, next);
  // });

  // router.post('/login', );

  return router;
}
