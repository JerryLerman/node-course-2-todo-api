var mongoose = require('mongoose');

// In Mongo collections can have many different data structures.
// In Mongoose you create models. We'll create a ToDo module
var Todo = mongoose.model('Todo',{
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {Todo};
