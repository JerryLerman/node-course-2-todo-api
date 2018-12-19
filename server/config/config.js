var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  var config = require('./config.json'); // Automatically turned into javascript
  var envConfig = config[env]; // if env=test, we grab test env property, etc.
                              // When you want to use a variable  to access a property you need to use square brackets
//Takes an object, returns all the keys as an array
Object.keys(envConfig).forEach((key) => {
  process.env[key] = envConfig[key];
});
}
