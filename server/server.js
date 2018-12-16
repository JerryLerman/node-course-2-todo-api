require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
// This variable will be set if running on Heroku, otherwise won't be
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  //console.log('New Post request');
  //console.log(req.body); // body gets stored by bodyparser
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then ((doc) => {
    res.send(doc);
    //console.log('Post successful');
  }, (e) => {
      //console.log('Post failed',JSON.stringify(e,undefined,2));
      res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET /todos/<id>
app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  //res.send(req.params);

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  })
  .then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }
    return res.status(200).send({todo});
  })
  .catch((e) => {
  res.status(400).send();
  });
});
// Go to httpstatuses.com to see all status code

app.delete('/todos/:id', authenticate, (req,res) => {
  var id = req.params.id;
  //console.log(`Request to delete ID: ${id}`);

  if (!ObjectID.isValid(id)) {
    //console.log('**ID is not valid');
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      //console.log("Couldn't find the ID");
      return res.status(404).send();
    }
    //console.log('Removed: ', JSON.stringify(todo,undefined,2));
    return res.status(200).send({todo});
  }). catch((e) => {
    //console.log("Received an error\n",JSON.stringify(e,undefined,2));
    res.status(400).send(e);
  });

});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime(); //Get javascript timestamp. Number of milliseconds
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {   // If not found, still have a successful call
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});


// POST users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  // var user = new User({
  //   email: body.email,
  //   password: body.password
  // });

  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

// app.get('/users/me', authenticate, (req, res) => {
//     res.send(req.user);
// });

app.get('/users/me',  authenticate, (req, res) => {
    res.send(req.user);
});




// POST /users/login {email, password}
// app.post('/users/login', (req,res) => {
//   var body = _.pick(req.body, ['email', 'password']);
//   var email = body.email;
//   var password = body.password;
//   var hashedPassword;
//
//   User.findOne({email}).then((user, err) => {
//     if (!user) {
//       console.log(`Did not find a user for ${email}`);
//       return res.status(404).send();
//     }
//     hashedPassword = user.password;
//     bcrypt.compare(password, hashedPassword, (berr, bres) => {
//       if (bres) {
//         return res.status(200).send({user});
//       } else {
//         return res.status(401).send();
//       }
//     });
//   }).catch((err) => {
//     console.log('Fell into findOne catch block\n',err);
//   });
// });
//

//POST /users/login {email, password}
app.post('/users/login', (req,res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(401).send();
  });
});

app.delete('/users/me/token', authenticate, (req,res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

    // This will create an id variable
module.exports = {app};



// var newUser = new User({
//   email: 'Jerry@Lerman.com'
// });
//
// newUser.save().then((doc) => {
//   console.log(JSON.stringify(doc,undefined,2));
// }, (e) => {
//   console.log('Unable to save user',e);
// })
//
// var newTodo = new Todo({
//   text: 'Cook dinner'
// });
//
// var whenCompleted = Date.now();
//
// var otherTodo = new Todo({
//   text: 'Start learning',
//   completed: true,
//   completedAt: whenCompleted
// });

// newTodo.save().then((doc) => {
//   console.log(JSON.stringify(doc,undefined,2));
// }, (e) => {
//   console.log('Unable to save todo',e);
// });
//
// otherTodo.save().then((doc) => {
//   console.log(JSON.stringify(doc,undefined,2));
// }, (e) => {
//   console.log('Unable to save todo',e);
// });
