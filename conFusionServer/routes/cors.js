const express = require('express');
const cors = require('cors');
const config = require('../config');

const whiteList = [
  `http://${config.hostName}:${config.port1}`,
  `https://${config.hostName}:${config.port2}`,
  `https://${config.hostName}:${config.port3}`,
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions = {};
  if (whiteList.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    callback(null, corsOptions); // callback expects two parameters: error and options
  } else {
    // corsOptions = { origin: false }; // disable CORS for this request
    callback(new Error('Not allowed by CORS'));
  }
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
