const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
// const ObjectId = require('mongodb').ObjectID;

const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

/**
 * route '/favorites'
 * user should already verified from authenticate.verifyUser
 * since this route is for authorized user, we want to apply same origin
 */
favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res, next) => {
    res.sendStatus(200);
  }) // enable pre-flight request
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then(favorite => {
        if (favorite) {
          jsonResponse200(res, favorite);
        } else {
          // create one if it is not exist
          // This path does not populate user information!
          Favorite.create({
            user: req.user._id,
          })
            .then(favorite => {
              jsonResponse200(res, favorite);
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          saveDishes(favorite, req.body, (err, favorite) => {
            if (err) {
              next(err);
            } else {
              jsonResponse200(res, favorite);
            }
          });
        } else {
          Favorite.create({
            user: req.user._id,
          })
            .then(favorite => {
              saveDishes(favorite, req.body, (err, favorite) => {
                if (err) {
                  next(err);
                } else {
                  jsonResponse200(res, favorite);
                }
              });
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndRemove({ user: req.user._id })
      .then(resp => {
        jsonResponse200(res, resp);
      })
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // not supported
    res.end('PUT operation is not supported on /favorites');
  });

function jsonResponse200(res, body) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(body);
}

function saveDishes(fav, dishes, callback) {
  dishes.forEach(dish => {
    // ensure we dont want to see duplicated dishID
    fav.dishes.addToSet(dish._id);
  });
  fav
    .save()
    .then(favorite => {
      callback(null, favorite);
    })
    .catch(err => callback(err, favorite));
}

module.exports = favoriteRouter;
