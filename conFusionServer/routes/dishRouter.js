const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route('/') // route '/dishes'
  .get((req, res, next) => {
    // res.end('Will send all the dishes to you!');
    Dishes.find({})
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
  .post((req, res, next) => {
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
  .put((req, res, next) => {
    res.statusCode = 403; // not supported
    res.end('PUT operation not supported on /dishes');
  })
  .delete((req, res, next) => {
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
  });

dishRouter
  .route('/:dishID')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishID)
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
  .post((req, res, next) => {
    res.statusCode = 403; // not supported
    res.end(`POST operation not supported on /dishes/${req.params.dishID}`);
  })
  .put((req, res, next) => {
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
  .delete((req, res, next) => {
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
  });

dishRouter
  .route('/:dishID/comments')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishID)
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
  .post((req, res, next) => {
    Dishes.findById(req.params.dishID)
      .then(
        dish => {
          if (!!dish) {
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
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /dishes/${req.params.dishID}/comments`
    );
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishID)
      .then(
        dish => {
          if (!!dish) {
            Dishes.update(
              { _id: req.params.dishID },
              { $set: { comments: [] } }
            ).then(dish => {
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
  });

dishRouter
  .route('/:dishID/comments/:commentID')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishID)
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
  .post((req, res, next) => {
    res.statusCode = 403; // not supported
    res.end(
      `POST operation not supported on /dishes/${req.params.dishID}/comments/${
        req.params.commentID
      }`
    );
  })
  .put((req, res, next) => {
    Dishes.findById(req.params.dishID)
      .then(
        dish => {
          if (!!dish && !!dish.comments.id(req.params.commentID)) {
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
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishID)
      .then(
        dish => {
          if (!!dish && !!dish.comments.id(req.params.commentID)) {
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
