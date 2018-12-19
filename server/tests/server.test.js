const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it ('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
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

  it ('should not create todo with invalid body data', (done) => {
    request(app)
    .post('/todos')
    .set('x-auth', users[0].tokens[0].token)
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
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(1);
    })
    .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);
  });

  it('should not return todo doc created by other user', (done) => {
    request(app)
    .get(`/todos/${todos[1]._id.toHexString()}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

var idNot2bFound = new ObjectID().toHexString();

  it(`should return 404 when searching for ${idNot2bFound}`, (done) => {
    request(app)
    .get (`/todos/${idNot2bFound}`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(404)
    .expect((res) => {
      expect(res.text.length).toBe(0);
    })
    .end(done);
  });

  it ('should return 404 for non-object ids', (done) => {
    request(app)
    .get ('/todos/123')
    .set('x-auth', users[0].tokens[0].token)
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
    .set('x-auth', users[1].tokens[0].token)
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
        expect(todo).toBeFalsy();
        done();
      }).catch((e) => done(e));
    });
  });

  it('should not remove a todo for a different user', (done) => {
    var hexId = todos[0]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      // Make sure the item is no longer in the database
      Todo.findById(hexId).then((todo) => {
        expect(todo).toBeTruthy();
        done();
      }).catch((e) => done(e));
    });
  });

  it ('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
    .delete (`/todos/${hexId}`)
    .set('x-auth', users[1].tokens[0].token)
    .expect(404)
    .expect((res) => {
      expect(res.text.length).toBe(0);
    })
    .end(done);
  });

  it ('should return 404 if object id is invalid', (done) => {
    request(app)
    .delete ('/todos/123')
    .set('x-auth', users[1].tokens[0].token)
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
    .set('x-auth', users[0].tokens[0].token)
    .send(todo)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(newText);
      //expect(res.body.todo.completed).toBeA('boolean');
      expect(typeof res.body.todo.completed).toBe('boolean');
      expect(res.body.todo.completed).toBe(true);
      //expect(res.body.todo.completedAt).toBeA('number');
      expect(typeof res.body.todo.completedAt).toBe('number');
    })
    .end(done);
  });

  it('should not update the todo if wrong user', (done) => {
    var hexId = todos[0]._id.toHexString();
    var newText = "Text change for wrong user test";

    const todo = {
      text: newText,
      completed: true,
    };

    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token+'1')
    .send(todo)
    .expect(401)
    .end(done);
  });

  it('should clear compledAt when todo is not completed', (done) => {
    var hexId = todos[0]._id.toHexString();
    var newText = "Text change for 2nd test";

    const todo = {
      text: newText,
      completed: false,
    };

    request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth', users[0].tokens[0].token)
    .send(todo)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(newText);
      //expect(res.body.todo.completed).toBeA('boolean');
      expect(typeof res.body.todo.completed).toBe('boolean');
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBeFalsy();
    })
    .end(done);

  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it ('should return 401 if not authenticated', (done) => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect((res) => {
      expect(res.body).toEqual({});
    })
    .end(done);
  });
});

describe('POST /users', () => {
  it ('should create a user', (done) => {
    var email = 'me@test.com';
    var password = '123mnb!';

    request(app)
      .post ('/users')
      .send({email,password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}). then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it ('should return \"lerman is not a valid email\"', (done) => {
    var email = "lerman";
    var password = 'APassword123';

    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .expect((res) => {
      expect((res.body.errors.email.message).includes(`${email} is not a valid email`)).toBeTruthy();
    })
    .end(done);
  });

  it ('should return error if password is invalid', (done) => {
    var email = "another@email.com";
    var password = 'short';

    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .expect((res) => {
      //console.log(JSON.stringify(res.body.errors,undefined,2));
      expect((res.body.errors.password.message).includes('is shorter than the minimum allowed length (6)')).toBeTruthy();
    })
    .end(done);
  });

  it('should not create user if email in use', (done) => {
    var email = 'Jerry@Lerman.com';
    var password = 'APassword123';

    request(app)
    .post('/users')
    .send({
      email: users[0].email,
      password
    })
    .expect(400)
    .expect((res) => {
      //console.log(JSON.stringify(res.body,undefined,2));
      expect((res.body.errmsg).includes('email_1 dup key')).toBeTruthy();
    })
    .end(done);
  });
});

describe('POST /users/login',() => {
  it('should login user and return auth token', (done) => {
    request(app)
    .post('/users/login')
    .send({
      email: users[1].email,
      password: users[1].password
    })
    .expect(200)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeTruthy();
    })
    .end((err,res) => {
      if  (err) {
        return done(err);
      }

      User.findById(users[1]._id).then((user) => {
        // expect(user.tokens[1]).toInclude({
        //   access: 'auth',
        //   token: res.headers['x-auth']
        // });
        //toObject() returns the raw data without the Mongoose stuff
        expect(user.toObject().tokens[1]).toMatchObject({
          access: 'auth',
          token: res.headers['x-auth']
        });
        done();
      }).catch((e) => done());
  });
});

  it ('should reject invalid login', (done) => {
    request(app)
    .post('/users/login')
    .send({
      email: users[1].email+"A",
      password: "Wrong Password"
    })
    .expect(401)
    .expect((res) => {
      expect(res.headers['x-auth']).toBeFalsy();
    })
    .end((err,res) => {
      if  (err) {
        return done(err);
      }

      User.findById(users[1]._id).then((user) => {
        expect(user.tokens.length).toBe(1);
        done();
      }).catch((e) => done());
    });
  });
});


describe ('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
    .delete('/users/me/token')
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .end((err,res) => {
      if  (err) {
        return done(err);
      }
      User.findById(users[0]._id).then((users) => {
        expect(users.tokens.length).toBe(0);
        done();
      }).catch((e) => done(e));
    });
  });
 });
