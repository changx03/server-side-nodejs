const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authenticate = require('../authenticate');
const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route('/') // route '/dishes'
  .get((req, res, next) => {
    Dishes.find({})
      .populate('comments.author')
      .then(
        dishes => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    Dishes.create(req.body)
      .then(
        dish => {
          console.log('Dish created', dish);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    res.statusCode = 403; // not supported
    res.end('PUT operation not supported on /dishes');
  })
  .delete(
    authenticate.verifyUser,
    authenticate.varifyAdmin,
    (req, res, next) => {
      console.log('Deleting all the dishes!');
      Dishes.remove({})
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

dishRouter
  .route('/:dishID')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishID)
      .populate('comments.author')
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    res.statusCode = 403; // not supported
    res.end(`POST operation not supported on /dishes/${req.params.dishID}`);
  })
  .put(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishID,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(
    authenticate.verifyUser,
    authenticate.varifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndRemove(req.params.dishID)
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

dishRouter
  .route('/:dishID/comments')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishID)
      .populate('comments.author')
      .then(
        dish => {
          if (!!dish) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
          } else {
            err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishID)
      .then(
        dish => {
          if (!!dish) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(dish => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            });
          } else {
            err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /dishes/${req.params.dishID}/comments`
    );
  })
  .delete(
    authenticate.verifyUser,
    authenticate.varifyAdmin,
    (req, res, next) => {
      Dishes.findById(req.params.dishID)
        .then(
          dish => {
            if (!!dish) {
              Dishes.update(
                { _id: req.params.dishID },
                { $set: { comments: [] } }
              ).then(result => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(result);
              });
            } else {
              err = new Error(`Dish ${req.params.dishID} not found`);
              err.status = 404;
              return next(err);
            }
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

dishRouter
  .route('/:dishID/comments/:commentID')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishID)
      .populate('comments.author')
      .then(
        dish => {
          if (!!dish && !!dish.comments.id(req.params.commentID)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentID));
          } else if (!dish) {
            err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // not supported
    res.end(
      `POST operation not supported on /dishes/${req.params.dishID}/comments/${
        req.params.commentID
      }`
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishID)
      .then(
        dish => {
          if (!!dish && !!dish.comments.id(req.params.commentID)) {
            // Check the author before update comment
            if (
              !dish.comments
                .id(req.params.commentID)
                .author.equals(req.user._id)
            ) {
              err = new Error(
                'You are not authorized to perform this operation!'
              );
              err.status = 403;
              return next(err);
            }

            if (req.body.rating) {
              dish.comments.id(req.params.commentID).rating = req.body.rating;
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentID).comment = req.body.comment;
            }
            dish.save().then(
              dish => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
              },
              err => next(err)
            );
          } else if (!dish) {
            err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishID)
      .then(
        dish => {
          if (!!dish && !!dish.comments.id(req.params.commentID)) {
            // Check the author before delete comment
            if (
              !dish.comments
                .id(req.params.commentID)
                .author.equals(req.user._id)
            ) {
              err = new Error(
                'You are not authorized to perform this operation!'
              );
              err.status = 403;
              return next(err);
            }

            dish.comments.id(req.params.commentID).remove();
            dish.save().then(
              dish => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
              },
              err => next(err)
            );
          } else if (!dish) {
            err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          } else {
            err = new Error(`Comment ${req.params.commentID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });
module.exports = dishRouter;
