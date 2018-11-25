var express = require('express');
var bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  console.log(req.body); // body gets stored by bodyparser
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then ((doc) => {
    res.send(doc);
  }, (e) => {
      res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET /todos/<id>
app.get('/todos/:id', (req, res) => {
  var id = req.params.id;
  //res.send(req.params);

  if (!ObjectID.isValid(id)) {
    res.status(404).send();
  }

  Todo.findById(id)
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

app.listen(3000, () => {
  console.log('Started on port 3000');
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
