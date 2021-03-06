var mongoose = require('mongoose');

// Tell mongoose which promise library to use
mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/TodoApp');
// Use local mongo db if not running under Heroku
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};


// Just about every hosting company sets this variable
// process.env.NODE_ENV === 'production'; //Usually the default value
// can be 'development' and 'test'
