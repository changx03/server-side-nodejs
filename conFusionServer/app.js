var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var index = require('./routes/index');
var users = require('./routes/users');
const dishRouter = require('./routes/dishRouter');

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

var app = express();

app.use(morgan('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/dishes', dishRouter);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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