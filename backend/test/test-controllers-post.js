// User chai assertion library and make it use chai-http for requests
let chai = require('chai');
let assert = chai.assert;
let expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// Url for backend
const app = 'http://localhost:3000'

// Get tester credentials
const globalCreds = require('./authenticate-tests');

// Test settings
let globalFakePostId = 0;
// Username AA does not exist; tests with fake credentials
let globalFakeUsername = 'AA'
let globalPostId = 2;
let globalPostPosition = 0;
let globalUserId = 1;
let globalUsername = 'OlutPoika25';

describe('test-controllers-post.js | findPostsByAll() : Returns 5 posts and orders them by their hidden value', () => {

  function analyser(callback) {
    return chai.request(app)
      .get('/post/postsall/value/' + globalPostPosition + '/' + globalUsername)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }

  it('Should return 5 posts', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else expect(res.body.length).to.be.equal(5);
    })
  });

  it('Should return status 200', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else expect(res.statusCode).to.be.equal(200);
    })
  });
  it('Posts ordered by their hidden value', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        let result = true;
        for (let i = 0; i < res.body.length - 1; i++) {

          if (res.body[i].value > res.body[i + 1].value) { }
          else { result = false; break; }
        }
        expect(result, 'posts should be ordered by hidden value').to.be.true;
      }
    })
  });
});

describe('test-controllers-post.js | findPostsByAll() : Returns 5 posts and orders them by createdAt date', () => {

  function analyser(callback) {
    return chai.request(app)
      .get('/post/postsall/createdAt/' + globalPostPosition + '/' + globalUsername)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }

  it('Should return 5 posts', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else expect(res.body.length).to.be.equal(5);
    })
  });

  it('Should return status 200', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else expect(res.statusCode).to.be.equal(200);
    })
  });
  it('Posts ordered by createdAt date', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        let result;
        for (let i = 0; i < res.body.length - 1; i++) {
          if (res.body[i].createdAt > res.body[i + 1].createdAt) {
            result = true;
          }
          else { result = false; break; }
        }
        expect(result, 'posts should be ordered by createdAt date').to.be.true;
      }
    })
  });
});

describe('test-controllers-post.js | findPostsByFollowed() : Returns 5 posts and orders them by their hidden value', () => {
  function analyser(callback) {
    return chai.request(app)
      .get('/post/postsfollowed/value/' + globalPostPosition + '/' + globalUserId)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }
  it('Returns object', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.body).to.be.not.null;
      }
    })
  });
  it('Returns status 200', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.statusCode).to.be.equal(200);
      }
    })
  });
  it('Posts ordered by their hidden value', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        let result = true;
        for (let i = 0; i < res.body.length - 1; i++) {
          if (res.body[i].value > res.body[i + 1].value) { }
          else { result = false; break; }
        }
        expect(result, 'posts should be ordered by hidden value').to.be.true;
      }
    })
  });
});

describe('test-controllers-post.js | findPostsByFollowed() : Returns 5 posts and orders them by createdAt date', () => {
  function analyser(callback) {
    return chai.request(app)
      .get('/post/postsfollowed/createdAt/' + globalPostPosition + '/' + globalUserId)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }
  it('Returns object', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.body, "body shouldn't be null").to.be.not.null;
      }
    })
  });
  it('Returns status 200', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.statusCode).to.be.equal(200);
      }
    })
  });
  it('Posts ordered by their date', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        let result = true;
        for (let i = 0; i < res.body.length - 1; i++) {
          if (res.body[i].createdAt > res.body[i + 1].createdAt) { }
          else { result = false; break; }
        }
        expect(result, 'posts should be ordered by date').to.be.true;
      }
    })
  });
});

describe('test-controllers-post.js | findUserPostAmount() : Counts how many posts specific user has', () => {
  function analyser(callback) {
    return chai.request(app)
      .get('/post/userpostsamount/' + globalUsername)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }
  it('Returns how many post user has', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.body.count, "").to.be.greaterThan(0);
        expect(res.statusCode, "status should return 200").to.be.equal(200);
      }
    })
  });
});

describe('test-controllers-post.js | findUserPostAmount() : No posts => Return 404', () => {
  function analyser(callback) {
    return chai.request(app)
      .get('/post/userpostsamount/' + globalFakeUsername)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }
  it('Returns value 0', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.body.count, "").to.be.equal(0);
      }
    })
  });
  it('Returns 404', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.statusCode, "status should return 404").to.be.equal(404);
      }
    })
  });
});

describe('test-controllers-post.js | findUserPosts() : Returns 5 posts by user X and orders them by their hidden value ', () => {
  globalUsername = 'DanielDanniska';

  function analyser(callback) {
    return chai.request(app)
      .get('/post/userposts/' + globalUsername + '/' + globalPostPosition + '/value')
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }

  it('Should return max 5 posts', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else expect(res.body.length, "Check if user has posts").to.be.greaterThan(0).and.to.be.lessThan(5);
    })
  });

  it('Should return status 200', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else expect(res.statusCode).to.be.equal(200);
    })
  });
  it('Posts ordered by their hidden value', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        let result = true;

        for (let i = 0; i < res.body.length - 1; i++) {
          if (res.body[i].value > res.body[i + 1].value) { }
          else { result = false; break; }
        }
        expect(result, 'posts should be ordered by hidden value').to.be.true;
      }
    })
  });
});

describe('test-controllers-post.js | findUserPosts() : Returns 5 posts by user X and orders them by date ', () => {
  globalUsername = 'DanielDanniska';
  globalPostOrder = 'createdAt';
  function analyser(callback) {
    return chai.request(app)
      .get('/post/userposts/' + globalUsername + '/' + globalPostPosition + '/createdAt')
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }

  it('Should return max 5 posts', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else expect(res.body.length, "Check if user has posts").to.be.greaterThan(0).and.to.be.lessThan(5);
    })
  });

  it('Should return status 200', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else expect(res.statusCode).to.be.equal(200);
    })
  });
  it('Posts ordered by their date', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        let result = true;
        for (let i = 0; i < res.body.length - 1; i++) {
          if (res.body[i].createdAt > res.body[i + 1].createdAt) { }
          else { result = false; break; }
        }
        expect(result, 'posts should be ordered by date').to.be.true;
      }
    })
  });
});

describe('test-controllers-post.js | getPostById() : Should return post as an object', () => {

  function analyser(callback) {
    return chai.request(app)
      .get('/post/postbyid/' + globalPostId)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }

  it('Returns object', () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.body.text.length).to.be.greaterThan(0);
      }
    })
  });
  it("Object's id is same with parameter id", () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.body.id).to.be.equal(globalPostId);
      }
    })
  });
  it("Returns status 200", () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.statusCode).to.be.equal(200);
      }
    })
  });
});

describe('test-controllers-post.js | getPostById() : Should return error with fake data', () => {

  function analyser(callback) {
    return chai.request(app)
      .get('/post/postbyid/' + globalFakePostId)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        callback(res, null)
      })
      .catch(function (err) {
        callback(null, err)
      });
  }
  it("Doesn't return object", () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.body.text).to.be.undefined;
      }
    })
  });
  it("Returns error message & status 404", () => {
    return analyser((res, err) => {
      if (err) throw err;
      else {
        expect(res.body.msg).to.exist;
        expect(res.statusCode).to.be.equal(404);
      }
    })
  });

});

describe('test-controllers-post.js | createPost() : Create new post (without picture)', () => {

  const test_createPostText = 'Erittäin loistavaa testaamista';
  const test_createPostDrinkName = 'Testauttaja';
  const test_createPostDrinkType = 'Alistava';
  const test_createPostRating = 5;
  const test_createPostUsername = 'OlutPoika25';
  let test_createPostResultId;

  it('Creates new post succesfully to user: ' + test_createPostUsername, () => {
    return chai.request(app)
      .post('/post/createpost/' + test_createPostUsername)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .send({
        'post': {
          'text': test_createPostText,
          'drink_name': test_createPostDrinkName,
          'drink_type': test_createPostDrinkType,
          'rating': test_createPostRating
        }
      })
      .then(function (res) {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.username).to.be.equal(test_createPostUsername);
        expect(res.body.text).to.be.equal(test_createPostText);
        expect(res.body.drink_name).to.be.equal(test_createPostDrinkName);
        expect(res.body.drink_type).to.be.equal(test_createPostDrinkType);
        expect(res.body.rating).to.be.equal(test_createPostRating);
        return test_createPostResultId = res.body.id;
      })
      .catch(function (err) {
        throw err;
      });
  });

  it('Check if post was really made with getPostById() ', () => {
    return chai.request(app)
      .get('/post/postbyid/' + test_createPostResultId)
      .set({ 'token': globalCreds.testUserToken, 'username': globalCreds.testUserName, 'id': globalCreds.testUserId})
      .then(function (res) {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.username).to.be.equal(test_createPostUsername);
        expect(res.body.text).to.be.equal(test_createPostText);
        expect(res.body.drink_name).to.be.equal(test_createPostDrinkName);
        expect(res.body.drink_type).to.be.equal(test_createPostDrinkType);
        expect(res.body.rating).to.be.equal(test_createPostRating);
      })
      .catch(function (err) {
        throw err;
      });
  });
});
