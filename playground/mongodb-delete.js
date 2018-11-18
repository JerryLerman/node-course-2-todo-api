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

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
  //   console.log(result);
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
  //   console.log(result);
  // });

  // findOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
  //   console.log(result);
  // })

  //Challenge. DeleteMany to delete all "Jerry"
  db.collection('Users').deleteMany({name: 'Jerry'}).then((result) => {
    console.log(`Deleted records with name of Jerry. There were ${result.n}`);
  });
  db.collection('Users').findOneAndDelete({_id: new ObjectID('5bf1db70f24655a3b09d9e84')}). then((result) => {
    console.log('Deleted 5bf1cbceab7c414926dec84d');
  });
  //client.close();
});
