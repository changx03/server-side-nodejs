const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const authenticate = require('../authenticate');
const cors = require('./cors');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/images'); // first paramter is error
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gid)$/)) {
    return callback(new Error('You can only upload images'), false);
  }
  callback(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
});

const router = express.Router();
router.use(bodyParser.json());

router
  .route('/')
  .options(cors.corsWithOptions) // enable pre-flight request
  .get(cors.cors, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation is not supported on /imageUpload');
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    upload.single('imageFile'),
    (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(req.file);
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end('PUT operation is not supported on /imageUpload');
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end('DELETE operation is not supported on /imageUpload');
    }
  );

module.exports = router;
