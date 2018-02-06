const express = require('express');
const bodyParser = require('body-parser');

const Users = require('../models/users');

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  Users.findOne({ username: req.body.username })
    .then(
      user => {
        if (user) {
          let err = new Error(`User ${req.body.username} already exist.`);
          err.status = 403;
          next(err);
        } else {
          return Users.create({
            username: req.body.username,
            password: req.body.password,
          });
        }
      },
      err => next(err)
    )
    .then(user => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        status: 'Registration successful',
        user: user.username,
      });
    })
    .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
  if (!req.session.user) {
    const authHeader = req.headers.authorization;

    let err = new Error('You are not authenticated');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;

    if (!authHeader) {
      return next(err);
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');
    const username = auth[0];
    const password = auth[1];

    Users.findOne({ username: username }).then(
      user => {
        if (user) {
          if (password === user.password) {
            req.session.user = 'authenticated';
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You are authenticated');
          } else {
            err = new Error('Incorrect password');
            err.status = 403;
            return next(err);
          }
        } else {
          return next(err);
        }
      },
      err => next(err)
    );
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
