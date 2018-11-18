//const MongoClient = require('mongodb').MongoClient;
// Pulling off ObjectDB from mongodb let's us create ObjectIDs even if it's not for mongodb
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

// ES6 Object destructuring
// var user = {name: 'Jerry', age: 67};
// var {name} = user;
// console.log(name);


MongoClient.connect('mongodb://localhost:27017/TodoApp',(err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  // find returns a cursor. find() returns a promise so we can tack on a then
  // This returns everything
  // db.collection('Todos').find().toArray().then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs,undefined,2));
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  //db.collection('Todos').find({completed: false}).toArray().then((docs) => {
  // db.collection('Todos').find({
  //     _id: new ObjectID('5bf099c58bf81399d0160447')
  //   }).toArray().then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs,undefined,2));
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  // db.collection('Todos').find().count().then((count) => {
  //   console.log(`Todos count: ${count}`);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  db.collection('Users').find({name: 'Jerry'}).toArray().then((docs) => {
    console.log('Users named Jerry:');
    console.log(JSON.stringify(docs,undefined,2));
  }, (err) => {
    console.Log('Unable to fetch users',err);
  });

  //client.close();
});
