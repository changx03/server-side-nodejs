const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');

const authenticate = require('./authenticate');
const config = require('./config');
const index = require('./routes/index');
const userRouter = require('./routes/userRouter');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

const url = config.mongoUrl;
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

app.use(
  session({
    name: 'session-id',
    secret: COOKIE_SECRET,
    saveUninitialized: false,
    resave: true,
    store: new FileStore(),
  })
);

app.use(passport.initialize());

// these routes do not require authentication
app.use('/', index);
app.use('/users', userRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
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
