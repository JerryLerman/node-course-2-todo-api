const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

//var id = '5bfad09c05031d2d9ce15d33';
//var badId = '5bfad09c05031d2d9ce15d3311';
var userID = '5bfade0b05031d2d9ce15f3f';

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos',todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo',todo);
// });
//
// Todo.findById(id)
// .then((todo) => {
//   if (!todo) {
//     return console.log('ID not found');
//   }
//   console.log('Todo by ID',todo);
// });


// if (!ObjectID.isValid(badId)) {
//   console.log('ID not valid');
// }

// Todo.findById(badId)
// .then((todo) => {
//   if (!todo) {
//     return console.log('ID not found');
//   }
//   console.log('Todo by ID',todo);
// }).catch((e) => console.log(e));

User.findById(userID)
.then((user) => {
  if (!user) {
    return console.Log('User not found');
  }
  console.log('User email:', user.email);
}, (e) => {
  console.log(e);
});
