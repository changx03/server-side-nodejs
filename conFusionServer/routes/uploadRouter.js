const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const authenticate = require('../authenticate');

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

const router = express.router();
router.use(bodyParser.json());

router
  .route('/')
  .get((req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation is not supported on /imageUpload');
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

  })
  .delete(
    authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

    }
  );

module.exports = router;
