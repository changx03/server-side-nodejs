const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route('/')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Contetn-Type', 'text/plain');
    next();
  })
  // route '/dishes'
  .get((req, res, next) => {
    res.end('Will send all the dishes to you!');
  })
  .post((req, res, next) => {
    console.log(req.body);
    res.end(
      `Will add the dish: ${req.body.name} with details: ${
        req.body.description
      }`
    );
  })
  .put((req, res, next) => {
    res.statusCode = 403; // not supported
    res.end('PUT operation not supported on /dishes');
  })
  .delete((req, res, next) => {
    res.end('Deleting all the dishes!');
  });

dishRouter
  .route('/:dishID')
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Contetn-Type', 'text/plain');
    next();
  })
  .get((req, res, next) => {
    res.end(`Will send details of the dish ${req.params.dishID} to you!`);
  })
  .post((req, res, next) => {
    res.statusCode = 403; // not supported
    res.end(`POST operation not supported on /dishes/${req.params.dishID}`);
  })
  .put((req, res, next) => {
    res.write(`Updating the dish: ${req.params.dishID}\n`);
    res.end(
      `Will update the dish: ${req.body.name} with details: ${
        req.body.description
      }`
    );
  })
  .delete((req, res, next) => {
    res.end(`Deleting dish: ${req.params.dishID}`);
  });

module.exports = dishRouter;
