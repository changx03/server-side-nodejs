var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

const Dishes = require('./models/dishes');
const url = 'mongodb://localhost:27017/conFusion';

// Keep alive
// mongoose.connect(uri, { keepAlive: 120 });
mongoose.connect(url).then(
  () => {
    console.log('Connected correctly to server');

    // let newDish = Dishes({
    //   name: 'Pizza',
    //   description: 'pepperoni',
    // });
    Dishes.create({
      name: 'Pizza',
      description: 'pepperoni',
    })
      // newDish
      //   .save()
      .then(dish => {
        console.log(dish);

        return Dishes.findByIdAndUpdate(
          dish._id,
          {
            $set: {
              description: 'Updated',
            },
          },
          {
            new: true,
          }
        ).exec();
      })
      .then(dish => {
        // console.log(dish);

        dish.comments.push({
          rating: 5,
          author: 'Luke',
        });

        // return Dishes.collection.drop();
        return dish.save();
      })
      .then(dish => {
        console.log(dish);

        return mongoose.connection.db.dropCollection('dishes');
      })
      // Not really need
      // .then(() => {
      //   return mongoose.connection.close();
      // })
      .catch(err => {
        console.error(err);
      });
  },
  err => {
    console.error(err);
  }
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

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
