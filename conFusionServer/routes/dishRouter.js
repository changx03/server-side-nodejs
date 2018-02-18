const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const cors = require('./cors');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

/**
 * route '/dishes'
 */
dishRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  }) // enable pre-flight request
  .get(cors.cors, (req, res, next) => {
    Dishes.find(req.query)
      .populate('comments.author')
      .then(
        dishes => {
          jsonResponse200(res, dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.create(req.body)
        .then(
          dish => {
            jsonResponse200(res, dish);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403; // not supported
      res.end('PUT operation is not supported on /dishes');
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      console.log('Deleting all the dishes!');
      Dishes.remove({})
        .then(
          resp => {
            jsonResponse200(res, resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

dishRouter
  .route('/:dishID')
  .options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishID)
      .populate('comments.author')
      .then(
        dish => {
          jsonResponse200(res, dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403; // not supported
      res.end(
        `POST operation is not supported on /dishes/${req.params.dishID}`
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndUpdate(
        req.params.dishID,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then(
          dish => {
            jsonResponse200(res, dish);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndRemove(req.params.dishID)
        .then(
          resp => {
            jsonResponse200(res, resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

dishRouter
  .route('/:dishID/comments')
  .options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishID)
      .populate('comments.author')
      .then(
        dish => {
          if (dish) {
            jsonResponse200(res, dish.comments);
          } else {
            let err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishID)
      .then(
        dish => {
          if (dish) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(dish => {
              Dishes.findById(dish._id)
                .populate('comments.author')
                .then(dish => {
                  jsonResponse200(res, dish);
                })
                .catch(err => next(err));
            });
          } else {
            let err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation is not supported on /dishes/${req.params.dishID}/comments`
    );
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findById(req.params.dishID)
        .then(
          dish => {
            if (dish) {
              Dishes.update(
                { _id: req.params.dishID },
                { $set: { comments: [] } }
              ).then(result => {
                jsonResponse200(res, result);
              });
            } else {
              let err = new Error(`Dish ${req.params.dishID} not found`);
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
  .options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishID)
      .populate('comments.author')
      .then(
        dish => {
          if (!!dish && !!dish.comments.id(req.params.commentID)) {
            jsonResponse200(res, dish.comments.id(req.params.commentID));
          } else if (!dish) {
            let err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          } else {
            let err = new Error(`Comment ${req.params.commentID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // not supported
    res.end(
      `POST operation is not supported on /dishes/${
        req.params.dishID
      }/comments/${req.params.commentID}`
    );
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
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
              let err = new Error(
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
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then(dish => {
                    jsonResponse200(res, dish);
                  });
              },
              err => next(err)
            );
          } else if (!dish) {
            let err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          } else {
            let err = new Error(`Comment ${req.params.commentID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
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
              let err = new Error(
                'You are not authorized to perform this operation!'
              );
              err.status = 403;
              return next(err);
            }

            dish.comments.id(req.params.commentID).remove();
            dish.save().then(
              dish => {
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then(dish => {
                    jsonResponse200(res, dish);
                  });
              },
              err => next(err)
            );
          } else if (!dish) {
            let err = new Error(`Dish ${req.params.dishID} not found`);
            err.status = 404;
            return next(err);
          } else {
            let err = new Error(`Comment ${req.params.commentID} not found`);
            err.status = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

function jsonResponse200(res, body) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(body);
}

module.exports = dishRouter;
