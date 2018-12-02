var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject(); // This will force running the catch
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send();
  });
};

module.exports = {authenticate};


// "authenticate" is a middleware function and it is placed into the route at
// this point. Because it's a middleware function, it is passed the req, res
// automatically and allowed to make changes to it. When the middleware
// is called, the function not only receives the req, res but also a 3rd argument
// that can be called when the middleware completes so you can wait until something
// finishes. It supports asynchronous actions. If you don't want to move on,
// you just don't call the 3rd function in the middleware but send a response
// instead. res.status(500).send(error.message)
// https://hackernoon.com/middleware-the-core-of-node-js-apps-ab01fee39200
