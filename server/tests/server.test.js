const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');


const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: Date.now()
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
  Todo.insertMany(todos);
}). then(() => done()); // Wipes all todos
});

describe('POST /todos', () => {
  it ('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    .end((err, res) => {
      if (err) {
        return done(err); // Return to stop execution
      }

      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((e) => done(e));
    });
  });

  it ('should not create todo with invalid body date', (done) => {
    request(app)
    .post('/todos')
    .send ({})
    .expect(400)
    .end((err,res) => {
      if (err) {
        return done(err);
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch((e) => done(e));
    });
  });
});

describe('GET /todos', () => {
  it ('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

var idNot2bFound = new ObjectID().toHexString();

  it(`should return 404 when searching for ${idNot2bFound}`, (done) => {
    request(app)
    .get (`/todos/${idNot2bFound}`)
    .expect(404)
    .expect((res) => {
      expect(res.text.length).toBe(0);
    })
    .end(done);
  });

  it ('should return 404 for non-object ids', (done) => {
    request(app)
    .get ('/todos/123')
    .expect(404)
    .expect((res) => {
      expect(res.text.length).toBe(0);
    })
    .end(done);
  });
});


describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo._id).toBe(hexId);
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      // Make sure the item is no longer in the database
      Todo.findById(hexId).then((todo) => {
        expect(todo).toNotExist();
        done();
      }).catch((e) => done(e));
    });
  });

  it ('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
    .delete (`/todos/${hexId}`)
    .expect(404)
    .expect((res) => {
      expect(res.text.length).toBe(0);
    })
    .end(done);
  });

  it ('should return 404 if object id is invalid', (done) => {
    request(app)
    .delete ('/todos/123')
    .expect(404)
    .expect((res) => {
      expect(res.text.length).toBe(0);
    })
    .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var newText = "Text change for 1st test";

    const todo = {
      text: newText,
      completed: true,
    };

    request(app)
    .patch(`/todos/${hexId}`)
    .send(todo)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(newText);
      expect(res.body.todo.completed).toBeA('boolean');
      expect(res.body.todo.completed).toBe(true);
      expect(res.body.todo.completedAt).toBeA('number');
    })
    .end(done);
  });

  it('should clear compledAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    var newText = "Text change for 2nd test";

    const todo = {
      text: newText,
      completed: false,
    };

    request(app)
    .patch(`/todos/${hexId}`)
    .send(todo)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(newText);
      expect(res.body.todo.completed).toBeA('boolean');
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toNotExist();
    })
    .end(done);

  });
});
