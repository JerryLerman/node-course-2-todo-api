const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');


// UserSchema will store the Schema for a user. It will store all the user properties
// We can't add methods to a model, but can to a Schema so this is not using the model user any longer.
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique:true,
    validate: {
      // validator: (value) => {
      //   return validator.isEmail(value);
      // },
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// Defines what gets returned to the user. This overrides Mongoose method toJSON
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject(); // Only the properties available on the document will toNotExist
  // Want to only return two properties of the document, the id and email.
  return _.pick(userObject, ['_id','email']);
};

// Create our own method called generateAuthToken that is part of the schema
// Not using an arrow function but a regular function because we need the "this"
// keyword. The "this" stores the individual document.
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  //  user.tokens.push({access, token}); // Doesn't always work
  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

var User = mongoose.model('User', UserSchema);

// Below replaced with the user schema so we can add methods
// var User = mongoose.model('User', {
//   email: {
//     type: String,
//     required: true,
//     minlength: 1,
//     trim: true,
//     unique:true,
//     validate: {
//       // validator: (value) => {
//       //   return validator.isEmail(value);
//       // },
//       validator: validator.isEmail,
//       message: '{VALUE} is not a valid email'
//     }
//   },
//   password: {
//     type: String,
//     require: true,
//     minlength: 6
//   },
//   tokens: [{
//     access: {
//       type: String,
//       required: true
//     },
//     token: {
//       type: String,
//       required: true
//     }
//   }]
// });

module.exports = {User};
