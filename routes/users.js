const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrat = require('passport-local').Strategy;

const User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    res.render('register', {
        'title': 'Register'
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', {
        'title': 'Login'
    });
});

router.post('/register', function (req, res, next) {
        //Get form Values
        let name = req.body.name;
        let email = req.body.email;
        let username = req.body.username;
        let password = req.body.password;
        let password2 = req.body.password2;

//check for image field
        if(req.files.profileimage){
            console.log('uploading file...');

            //Profile Image Info
            let profileImageOriginalName = req.files.profileimage.originalname;
            let profileImageName = req.file.profileimage.name;
            let profileImageMime = req.file.profileimage.mimetype;
            let profileImagePath = req.file.profileimage.path;
            let profileImageExt = req.file.profileimage.extention;
            let profileImageSize = req.file.profileimage.size;
        } else {
            // set a default image
             profileImageName = 'noImage.png';
        }

        //form validation
        req.checkBody('name', 'Name field is req.').notEmpty();
        req.checkBody('email', 'Email field is req.').notEmpty();
        req.checkBody('email', 'Email not valid').isEmail();
        req.checkBody('username', 'Username field is req.').notEmpty();
        req.checkBody('password', 'password field is req.').notEmpty();
        req.checkBody('password2', 'passwords do not match').equals(req.body.password);

        //check for err
        let errors = req.validationErrors();

        if(errors){
            res.render('register', {
                errors: errors,
                name: name,
                email: email,
                username: username,
                password: password,
                password2: password2
            });
        } else{
            let newUser = new User({
                name: name,
                email: email,
                username: username,
                password: password,
                profileimage: profileImageName
            });

            //Create User
            User.createUser(newUser, function (err, user) {
               if(err) throw err;
               console.log(user);
            });

            //success Message
            req.flash('success', 'You are now reg. and my log-in');

            res.location('/');
            res.redirect('/');
        }
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrat(
    function (username, passsword, done) {
         User.getUserByUsername(username, function (err, user) {
            if(err) throw err;
            if(!user){
            console.log('Unknown User');
            return done(null, false,{message: 'Unknown User'});
            }
            User.comparePassword(passsword, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                }else{
                    console.log('Invalid Pass.');
                    return done(null, false, {message:'Invalid Password'});
                }
            });
        });
    }
));

router.post('/login', passport.authenticate('local', {failureRedirect:'/users/login', failureFlash:'Invalid Username or Pass'}),function (req, res) {
    console.log('Authentication Successful');
    req.flash('success', 'You are in!!');
    res.redirect('/');
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/users/login');
});

module.exports = router;
