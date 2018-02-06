const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const index = require('./routes/index');
const users = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

const url = 'mongodb://localhost:27017/conFusion';
const Dishes = require('./models/dishes');

mongoose.connect(url, { keepAlive: 120 }).then(
  () => {
    console.log('Connected correctly to MongoDB');
  },
  err => {
    console.error(err);
  }
);

const COOKIE_SECRET = 'my-secret-cat';

const app = express();

app.use(morgan('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));

function auth(req, res, next) {
  console.log(req.signedCookies);

  let err = new Error('You are not authenticated');
  res.setHeader('WWW-Authenticate', 'Basic');
  err.status = 401;

  if (!req.signedCookies.user) {
    let authHeader = req.headers.authorization;
    console.log(authHeader);

    if (!authHeader) {
      return next(err);
    }

    let auth = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');
    let username = auth[0];
    let password = auth[1];

    if (username === 'admin' && password === 'password') {
      res.cookie('user', 'admin', { signed: true });
      next();
    } else {
      return next(err);
    }
  } else {
    if (req.signedCookies.user === 'admin') {
      next();
    } else {
      return next(err);
    }
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
