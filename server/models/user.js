const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


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
// .methods. creates an instance method
UserSchema.methods.generateAuthToken = function () {
  var user = this;  // lower "u" because it's an instance user
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  //  user.tokens.push({access, token}); // Doesn't always work
  try {
    user.tokens = user.tokens.concat([{access, token}]);
  } catch(e) {
    console.log("Failed to save token ",JSON.stringify(e,undefined,2));
    return Promise.reject();
  }

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

//Statics is used for model methods
UserSchema.statics.findByToken = function (token) {
  var User = this; // Upper "U" because it's a model this
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123'); // Throws exception if anything doesn't match
  } catch (e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,  // Looking inside the tokens array for a match
    'tokens.access': 'auth'
  })
};

UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      // Return a rejected promise which will trigger the catch block
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {;
          resolve(user);
        } else {
          return reject();
        }
      });
    });
  });
};


// This runs just before we do the save
UserSchema.pre('save', function (next) {
  var user = this;
  // We only want to hash the password if it's been modified
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next(); // Not modified, just move on
  }
});

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
