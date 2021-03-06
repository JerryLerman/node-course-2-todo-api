const {ObjectID} = require('mongodb');
const jwt = require('jsonWebToken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'Jerry@Lerman.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'Jerry@nowhere.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  _creator: userTwoId,
  completed: true,
  completedAt: Date.now()
}];

// const populateTodos = (done) => {
//     Todo.remove({}).then(() => {
//     Todo.insertMany(todos);
//   }).then(() => done());
// };

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
    Todo.insertMany(todos);
  }).then(() => done())
  .catch((e) => done(e));
};

// const populateUsers = (done) => {
//   User.remove({}).then(() => {
//     var userOne = new User(users[0]).save();
//     var userTwo = new User(users[1]).save();
//
//     // Wait for all promises to finish
//     return Promise.all([userOne, userTwo])
//   }).then(() => done());
// };


const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    // Wait for all promises to finish
    return Promise.all([userOne, userTwo])
  }).then(() => done())
  .catch((e) => done(e));
};

module.exports = {todos, populateTodos, users, populateUsers};
