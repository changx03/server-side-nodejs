const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  admin: {
    type: Boolean,
    default: false,
  },
});

const Users = mongoose.model('User', User);

module.exports = Users;
