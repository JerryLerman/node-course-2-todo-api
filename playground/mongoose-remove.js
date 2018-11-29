const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

//Todo.findOneAndRemove
//Todo.findByIdAndRemove

Todo.findOneAndRemove({_id: '5c00245805031d2d9ce1c48c'}). then((todo) => {

});

Todo.findByIdAndRemove('5c00245805031d2d9ce1c48c').then((todo) => {
  console.log(todo);
});
