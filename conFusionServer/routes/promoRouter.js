const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');
const cors = require('./cors');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter
  .route('/')
  .options(cors.corsWithOptions) // enable pre-flight request
  .get(cors.cors, (req, res, next) => {
    Promotions.find({})
      .then(
        promos => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promos);
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
      Promotions.create(req.body)
        .then(
          promo => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
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
      res.end('PUT operation not supported on /promotions');
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.remove({})
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

promoRouter
  .route('/:promoID')
  .options(cors.corsWithOptions)
  .get(cors.cors, (req, res, next) => {
    Promotions.findById(req.params.promoID)
      .then(
        promo => {
          res.statusCode = 200;
          res.setHeader('Contetn-Type', 'application/json');
          res.json(promo);
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
        `POST operation not supported on /promotions/${req.params.promoID}`
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.findByIdAndUpdate(
        req.params.promoID,
        { $set: req.body },
        { new: true }
      )
        .then(
          promo => {
            res.statusCode = 200;
            res.setHeader('Contetn-Type', 'application/json');
            res.json(promo);
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
      Promotions.findByIdAndRemove(req.params.promoID)
        .then(
          resp => {
            res.statusCode = 200;
            res.setHeader('Contetn-Type', 'application/json');
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

module.exports = promoRouter;
