const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const poassportLocalMon = require('passport-local-mongoose');

const User = new Schema({
  firstname: {
    type: String,
    default: '',
  },
  lastname: {
    type: String,
    default: '',
  },
  admin: {
    type: Boolean,
    default: false,
  },
  facebookID: String,
});

User.plugin(poassportLocalMon);

const Users = mongoose.model('User', User);

module.exports = Users;
