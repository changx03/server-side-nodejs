var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/conFusion';

MongoClient.connect(url, (err, database) => {
  assert.equal(err, null);
  console.log('Connet correctly to server');

  const conFusionDb = database.db('conFusion');
  const collection = conFusionDb.collection('dishes');
  collection.insertOne(
    { name: 'fromExpress', description: 'test2' },
    (err, result) => {
      assert.equal(err, null);
      console.log('After insert:');
      console.log(result.ops);
      collection.find({}).toArray((err, docs) => {
        assert.equal(err, null);
        console.log('Found:', docs);

        conFusionDb.dropCollection('dishes', (err, result) => {
          assert.equal(err, null);
          database.close();
        });
      });
    }
  );
});

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

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
