const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Promostions = require('../models/promotions');
const authenticate = require('../authenticate');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter
  .route('/') // route '/dishes'
  .get((req, res, next) => {
    Promostions.find({})
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
  .post(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    Promostions.create(req.body)
      .then(
        promo => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promo);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    res.statusCode = 403; // not supported
    res.end('PUT operation not supported on /promotions');
  })
  .delete(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    Promostions.remove({})
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

promoRouter
  .route('/:promoID')
  .get((req, res, next) => {
    Promostions.findById(req.params.promoID)
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
  .post(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    res.statusCode = 403; // not supported
    res.end(
      `POST operation not supported on /promotions/${req.params.promoID}`
    );
  })
  .put(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    Promostions.findByIdAndUpdate(
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
  })
  .delete(authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
    Promostions.findByIdAndRemove(req.params.promoID)
      .then(
        resp => {
          res.statusCode = 200;
          res.setHeader('Contetn-Type', 'application/json');
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = promoRouter;
