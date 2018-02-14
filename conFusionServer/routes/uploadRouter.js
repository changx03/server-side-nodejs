const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const authenticate = require('../authenticate');

const router = express.router();
router.use(bodyParser.json());


module.exports = router;
