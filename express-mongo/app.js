var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dboper = require('./operation');

const url = 'mongodb://localhost:27017/conFusion';
const colName = 'dishes';

// MongoClient.connect(url, (err, database) => {
//   assert.equal(err, null);
//   console.log('Connet correctly to server');

//   const conFusionDb = database.db('conFusion');

//   dboper.insertDocument(
//     conFusionDb,
//     { name: 'Vadonut', description: 'nut' },
//     colName,
//     result => {
//       console.log('Insert', result.ops);
//       console.log('\n');

//       dboper.findDocuments(conFusionDb, colName, docs => {
//         console.log('Found', docs);
//         console.log('\n');

//         dboper.updateDocument(
//           conFusionDb,
//           { name: 'Vadonut' },
//           { description: 'Updated' },
//           colName,
//           result => {
//             console.log('Updated', result.result.ops);
//             console.log('\n');

//             dboper.findDocuments(conFusionDb, colName, docs => {
//               console.log('Found', docs);
//               console.log('\n');

//               conFusionDb.dropCollection(colName, result => {
//                 console.log('Dropped collection', result);
//                 database.close();
//               });
//             });
//           }
//         );
//       });
//     }
//   );
// });

MongoClient.connect(url)
  .then(
    db => {
      const conFusionDb = db.db('conFusion');

      dboper
        .insertDocument(
          conFusionDb,
          { name: 'Vadonut', description: 'nut' },
          colName
        )
        .then(result => {
          console.log('Insert', result.ops);
          return dboper.findDocuments(conFusionDb, colName);
        })
        .then(docs => {
          console.log('Found', docs);
          return dboper.updateDocument(
            conFusionDb,
            { name: 'Vadonut' },
            { description: 'Updated' },
            colName
          );
        })
        .then(result => {
          console.log('Updated Document:\n', result.result);

          return dboper.findDocuments(conFusionDb, 'dishes');
        })
        .then(docs => {
          console.log('Found Updated Documents:\n', docs);

          return conFusionDb.dropCollection('dishes');
        })
        .then(result => {
          console.log('Dropped Collection: ', result);

          return db.close();
        })
        .catch(err => {
          console.log(err);
        });
    },
    err => {
      console.log(err);
    }
  )
  .catch(err => {
    console.log(err);
  });

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
